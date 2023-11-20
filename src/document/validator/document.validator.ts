import { FileValidator } from '@nestjs/common';
import * as sharp from 'sharp';
import { errorMessage } from 'src/dictionaries/error-message';

export type FileTypeValidatorOptions = {
    fileType: string | RegExp;
};

const fileTypeRegex = new RegExp(/image\/*|application\/pdf/);

export class DocumentValidator extends FileValidator<
    Record<string, any>,
    Express.Multer.File
> {
    async isImageValid(image: Express.Multer.File) {
        return sharp(image.buffer)
            .stats()
            .then(() => true)
            .catch(() => false);
    }

    getFileType(mimeType: string) {
        if (mimeType.match(/image\/*/)) {
            return 'image';
        }
        if (mimeType.match(/application\/pdf/)) {
            return 'pdf';
        }
        return null;
    }

    isPdfValid(pdf: Express.Multer.File) {
        return (
            Buffer.isBuffer(pdf.buffer) &&
            pdf.buffer.lastIndexOf('%PDF-') === 0 &&
            pdf.buffer.lastIndexOf('%%EOF') > -1
        );
    }

    buildErrorMessage(): string {
        return errorMessage.document.validation.format;
    }

    async isValid(file?: Express.Multer.File): Promise<boolean> {
        if (!this.validationOptions) {
            return true;
        }
        const isTypeValid =
            'mimetype' in file && !!file.mimetype.match(fileTypeRegex);
        const type = this.getFileType(file.mimetype);

        let isFileValid = false;
        if (type === 'image') {
            isFileValid = await this.isImageValid(file);
        } else if (type === 'pdf') {
            isFileValid = this.isPdfValid(file);
        }

        return !!file && isTypeValid && isFileValid;
    }
}
