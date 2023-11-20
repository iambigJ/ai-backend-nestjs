import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentType } from './entity/document.entity';
import { Readable } from 'stream';
import * as fs from 'fs/promises';
import { WalletService } from 'src/wallet/wallet.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';

describe('DocumentService', () => {
    let documentService: DocumentService;
    let documentRepository: Repository<Document>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DocumentService,
                ConfigService,
                {
                    provide: getRepositoryToken(Document),
                    useValue: {
                        save: jest.fn(),
                    },
                },
                {
                    provide: WalletService,
                    useValue: {
                        withdraw: jest.fn(),
                    },
                },
                {
                    provide: AmqpConnection,
                    useValue: {
                        publish: jest.fn(),
                    },
                },
            ],
        }).compile();

        documentService = module.get<DocumentService>(DocumentService);
        documentRepository = module.get<Repository<Document>>(
            getRepositoryToken(Document),
        );
    });

    it('should be defined', () => {
        expect(documentService).toBeDefined();
    });

    describe('createDocument', () => {
        it('should create a document', async () => {
            const userId = 'user123';
            const file: Express.Multer.File = {
                buffer: Buffer.from(await fs.readFile('storage/test/test.pdf')),
                originalname: 'document.pdf',
                mimetype: 'application/pdf',
                fieldname: '',
                encoding: '',
                size: 0,
                stream: new Readable(),
                destination: '',
                filename: '',
                path: '',
            };
            const type = DocumentType.General;
            try {
                const document = await documentService.createDocument(
                    userId,
                    file,
                    type,
                );
            } catch (err) {
                fail(err);
            }

            // Add more assertions as needed
        });
    });

    describe('calculatePdf', () => {
        it('should calculate pages count of a pdf', async () => {
            const file: Express.Multer.File = {
                buffer: Buffer.from(await fs.readFile('storage/test/test.pdf')),
                originalname: 'document.pdf',
                mimetype: 'application/pdf',
                fieldname: '',
                encoding: '',
                size: 0,
                stream: new Readable(),
                destination: '',
                filename: '',
                path: '',
            };
            const pagesCount = await documentService.calculatePagesCount(file);
            expect(pagesCount).toEqual(8);
        });
    });
});
