import { Nack } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document, DocumentStatus } from './entity/document.entity';
import { Repository } from 'typeorm';
import { OcrSubMessage } from './types/ocr';
import { ConsumeMessage } from 'amqplib';
import { getSubscribeOcrDecorator } from 'src/common/decorator/subscribe-ocr.decorator';
import { WalletService } from 'src/wallet/wallet.service';

const SubscribeOCR = getSubscribeOcrDecorator();
@Injectable()
export class DocumentConsumer {
    constructor(
        @InjectRepository(Document)
        private documentRepository: Repository<Document>,
        private walletService: WalletService,
    ) {}

    @SubscribeOCR
    public async handler(message: OcrSubMessage, msg: ConsumeMessage) {
        try {
            await this.documentRepository.save({
                id: message.documentId,
                status: DocumentStatus.DONE,
                outImageUri: message.outImageUri,
                wordUri: message.wordUri,
                textUri: message.txtUri,
                jsonUri: message.jsonUri,
            });
        } catch (err) {
            await this.documentRepository.update(message.documentId, {
                status: DocumentStatus.FAILED,
            });
            const doc = await this.documentRepository.findOne({
                where: { id: message.documentId },
                relations: ['owner'],
            });
            await this.walletService.deposit(doc.owner.id, doc.pageCount, null);
            console.log(err);
            return new Nack();
        }
    }
}
