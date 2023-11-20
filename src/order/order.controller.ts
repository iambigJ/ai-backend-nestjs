import {
    Body,
    Controller,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { PaymentInvoiceDto } from './dto/payment-invoice.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guard/auth-jwt.guard';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { responseMessage } from 'src/dictionaries/response-message';

@ApiSecurity('user-auth')
@ApiTags('order')
@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @UseGuards(JwtAuthGuard)
    @Post('invoice')
    async getInvoice(@Body() data: PaymentInvoiceDto) {
        const invoice = await this.orderService.getPaymentInvoice(data);
        return {
            message: responseMessage.order.getInvoice,
            invoice,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('submit')
    async submitOrder(@Body() data: PaymentInvoiceDto, @Req() req: Request) {
        const gatewayLink = await this.orderService.getPaymentGatewayUrl(
            req.user.id,
            data,
        );
        return {
            message: responseMessage.order.submitOrder,
            gatewayLink,
        };
    }

    @Post('webhook/:callback_id')
    async completeOrder(
        @Query('callback_id') callbackId: string,
        @Body() data: PaymentCallbackDto,
        @Res() res: Response,
    ) {
        const result = await this.orderService.handleGatewayCallback(
            callbackId,
            data,
        );
        return res.json(result);
        // res.redirect('/');
    }
}
