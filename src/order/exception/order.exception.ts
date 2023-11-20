import { HttpException, HttpStatus } from '@nestjs/common';
import { errorMessage } from 'src/dictionaries/error-message';

export class GatewayErrorException extends HttpException {
    constructor() {
        super(errorMessage.order.gatewayError, HttpStatus.SERVICE_UNAVAILABLE);
    }
}

export class OrderNotFoundException extends HttpException {
    constructor() {
        super(errorMessage.order.orderNotFound, HttpStatus.NOT_FOUND);
    }
}
