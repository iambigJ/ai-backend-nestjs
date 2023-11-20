import { HttpException, HttpStatus } from '@nestjs/common';
import { errorMessage } from 'src/dictionaries/error-message';

export class NoPackageException extends HttpException {
    constructor() {
        super(errorMessage.wallet.noPackage, HttpStatus.BAD_REQUEST);
    }
}

export class InsufficientBalanceException extends HttpException {
    constructor() {
        super(errorMessage.wallet.insufficientBalance, HttpStatus.BAD_REQUEST);
    }
}
