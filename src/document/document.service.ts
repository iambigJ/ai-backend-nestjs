import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Document,
    DocumentStatus,
    DocumentType,
    OcrOptions,
} from './entity/document.entity';
import { IsNull, Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { getPdfInfo } from 'src/utils/pdf';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { OcrPublishMessage } from './types/ocr';
import { WalletService } from 'src/wallet/wallet.service';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config';
import { FindDocumentQuery } from './dto/find.dto';
import { PageMetaDto } from 'src/pagination/dto/page-meta.dto';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';
import {
    DocumentNotFoundException,
    DocumentNotReady,
    OcrDoneException,
    TextNotFoundException,
    UnsupportedFileFormatException,
    WaitException,
    WrongPdfException,
} from './exception/document.exception';

@Injectable()
export class DocumentService {
    private rabbitMQConfig: Config['rabbitMQ'];
    constructor(
        @InjectRepository(Document)
        private documentRepository: Repository<Document>,
        private readonly amqpConnection: AmqpConnection,
        private walletService: WalletService,
        private readonly configService: ConfigService<Config>,
    ) {
        this.rabbitMQConfig = this.configService.get('rabbitMQ');
    }

    async calculatePagesCount(file: Express.Multer.File) {
        const { pages } = await getPdfInfo(file.buffer);
        return pages;
    }

    getFileType(mimeType: string) {
        if (mimeType.match(/image\/*/)) {
            return 'image';
        }
        if (mimeType.match(/application\/pdf/)) {
            return 'pdf';
        }
        throw new UnsupportedFileFormatException();
    }

    async createDocument(
        userId: string,
        file: Express.Multer.File,
        type: DocumentType.General | DocumentType.Identity,
    ) {
        const documentId = randomUUID();
        const savingDirectory = path.join(type, userId, documentId);
        const originalFileUri = path.join(savingDirectory, file.originalname);
        const fileType = this.getFileType(file.mimetype);
        let pageCount = 1;
        try {
            if (fileType === 'pdf') {
                pageCount = await this.calculatePagesCount(file);
            }
        } catch (err) {
            throw new WrongPdfException();
        }

        const document = await this.documentRepository.save({
            id: documentId,
            owner: { id: userId },
            fileType,
            pageCount,
            status: DocumentStatus.UPLOADED,
            originalFilename: file.originalname,
            originalFileUri: originalFileUri,
            type,
        });
        await fs.mkdir(path.resolve('storage', savingDirectory), {
            recursive: true,
        });
        await fs.writeFile(
            path.resolve('storage', originalFileUri),
            file.buffer,
        );
        return document;
    }

    async findOneDocument(
        documentId: string,
        userId: string,
    ): Promise<Document | null> {
        return this.documentRepository
            .findOne({
                where: {
                    owner: { id: userId },
                    id: documentId,
                    deletedAt: IsNull(),
                },
            })
            .then((doc) => doc)
            .catch(() => null);
    }

    async findAll(userId: string, data: FindDocumentQuery) {
        const [documents, itemCount] =
            await this.documentRepository.findAndCount({
                where: {
                    owner: { id: userId },
                    status: data.status,
                    deletedAt: IsNull(),
                },
                order: {
                    createdAt: data.order,
                },
                take: data.take,
                skip: data.skip,
            });
        const pageMetaDto = new PageMetaDto({
            itemCount,
            pageOptionsDto: data,
        });
        return new PaginationDto(documents, pageMetaDto);
    }

    async deleteDocument(documentId: string, userId: string) {
        return this.documentRepository.softDelete({
            id: documentId,
            owner: { id: userId },
        });
    }

    async editDocumentText(documentId: string, userId: string, text: string) {
        const doc = await this.findOneDocument(documentId, userId);
        if (!doc) {
            throw new DocumentNotFoundException();
        }
        if (doc.status !== DocumentStatus.DONE) {
            throw new DocumentNotReady();
        }
        if (!doc.textUri) {
            throw new TextNotFoundException();
        }

        return fs.writeFile(path.resolve('storage', doc.textUri), text);
    }

    async publishTask(data: OcrPublishMessage) {
        const taskQueue = this.rabbitMQConfig.taskQueue;
        const channel = this.amqpConnection.channel;
        await channel.assertQueue(taskQueue, {
            durable: true,
        });
        channel.sendToQueue('task_queue', Buffer.from(JSON.stringify(data)), {
            correlationId: data.documentId,
            replyTo: taskQueue,
            persistent: true,
        });
    }

    async startOCR(documentId: string, userId: string, ocrOptions: OcrOptions) {
        const document = await this.findOneDocument(documentId, userId);
        if (!document) {
            throw new DocumentNotFoundException();
        }
        if (document.status === DocumentStatus.PENDING) {
            throw new WaitException();
        }
        if (document.status === DocumentStatus.DONE) {
            throw new OcrDoneException();
        }
        const cost = +document.pageCount;

        await this.walletService.withdraw(userId, cost);

        await this.documentRepository.save({
            id: documentId,
            ocrOptions,
            status: DocumentStatus.PENDING,
        });
        const directory = document.originalFileUri.split('/');
        directory.pop();
        this.publishTask({
            documentId: document.id,
            docType: document.type,
            fileType: document.fileType,
            filename: document.originalFilename,
            directory: directory.join('/'),
            ocrOptions,
        });
    }
}
