import {
    PipeTransform,
    Injectable,
    Scope,
    Inject,
    BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { getFileType } from 'src/utils/file';
import { WalletService } from 'src/wallet/wallet.service';
import {
    DocumentSizeException,
    UnsupportedFileFormatException,
} from '../exception/document.exception';

@Injectable({ scope: Scope.REQUEST })
export class DocumentSizeValidationPipe implements PipeTransform {
    constructor(
        @Inject(REQUEST) private req: Request,
        private walletService: WalletService,
    ) {}

    async transform(file: Express.Multer.File) {
        const fileType = getFileType(file.mimetype);
        const userId = this.req.user.id;
        if (!fileType) {
            throw new UnsupportedFileFormatException();
        }
        const { maxImageSize, maxPdfSize } =
            await this.walletService.findMaxUploadSize(userId);

        if (fileType === 'image' && maxImageSize < file.size) {
            throw new DocumentSizeException();
        }
        if (fileType === 'pdf' && maxPdfSize < file.size) {
            throw new DocumentSizeException();
        }
        return file;
    }
}
