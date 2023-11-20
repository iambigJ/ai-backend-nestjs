import { HttpException, HttpStatus } from '@nestjs/common';
import { errorMessage } from 'src/dictionaries/error-message';

export class WrongPasswordException extends HttpException {
    constructor() {
        super(errorMessage.user.wrongPassword, HttpStatus.BAD_REQUEST);
    }
}
