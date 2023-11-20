import { HttpException, HttpStatus } from '@nestjs/common';
import { errorMessage } from 'src/dictionaries/error-message';

export class UnsupportedFileFormatException extends HttpException {
    constructor() {
        super(
            errorMessage.document.unsupportedFileType,
            HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        );
    }
}

export class WrongPdfException extends HttpException {
    constructor() {
        super(errorMessage.document.wrongPdf, HttpStatus.BAD_REQUEST);
    }
}

export class DocumentNotFoundException extends HttpException {
    constructor() {
        super(errorMessage.document.documentNotFound, HttpStatus.NOT_FOUND);
    }
}

export class DocumentNotReady extends HttpException {
    constructor() {
        super(errorMessage.document.documentNotReady, HttpStatus.BAD_REQUEST);
    }
}

export class TextNotFoundException extends HttpException {
    constructor() {
        super(errorMessage.document.textNotFound, HttpStatus.NOT_FOUND);
    }
}
export class WaitException extends HttpException {
    constructor() {
        super(errorMessage.document.wait, HttpStatus.BAD_REQUEST);
    }
}
export class OcrDoneException extends HttpException {
    constructor() {
        super(errorMessage.document.ocrDone, HttpStatus.BAD_REQUEST);
    }
}

export class DocumentSizeException extends HttpException {
    constructor() {
        super(
            errorMessage.document.validation.size,
            HttpStatus.PAYLOAD_TOO_LARGE,
        );
    }
}
