import { HttpException, HttpStatus } from '@nestjs/common';
import { errorMessage } from 'src/dictionaries/error-message';

export class InvalidOtpException extends HttpException {
    constructor() {
        super(errorMessage.auth.invalidOtp, HttpStatus.BAD_REQUEST);
    }
}

export class OtpAlreadySendException extends HttpException {
    constructor() {
        super(errorMessage.auth.otpAlreadySend, HttpStatus.BAD_REQUEST);
    }
}

export class PasswordMissedException extends HttpException {
    constructor() {
        super(errorMessage.auth.passwordMissed, HttpStatus.BAD_REQUEST);
    }
}

export class AlreadyHaveAccountException extends HttpException {
    constructor() {
        super(errorMessage.auth.alreadyHaveAccount, HttpStatus.BAD_REQUEST);
    }
}
