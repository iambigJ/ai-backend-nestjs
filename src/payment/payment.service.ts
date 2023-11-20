import { paymentGatewayTransformer } from './../utils/payment';
import { Inject, Injectable } from '@nestjs/common';
import { Order, OrderStatus } from 'src/order/entity/order.entity';
import { DateTime } from 'luxon';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config';
import { PaymentGatewayResponse } from 'src/utils/payment';
import { PaymentCallbackDto } from '../order/dto/payment-callback.dto';
import { GatewayClient } from './types';

@Injectable()
export class PaymentService {
    private paymentConf: Config['paymentGateway'];

    constructor(
        @Inject('PAYMENT_GATEWAY')
        private readonly gatewayClient: GatewayClient,
        private readonly configService: ConfigService<Config, true>,
    ) {
        this.paymentConf = this.configService.get('paymentGateway', {
            infer: true,
        });
    }

    async payRequest(
        order: Order,
    ): Promise<PaymentGatewayResponse & { refId: string }> {
        const appBaseUrl = this.configService.get('appBaseUrl', {
            infer: true,
        });

        const result = await this.gatewayClient.bpPayRequestAsync({
            terminalId: this.paymentConf.terminalId,
            userName: this.paymentConf.username,
            userPassword: this.paymentConf.password,
            orderId: order.id,
            amount: order.payAmount,
            localDate: DateTime.fromJSDate(order.createdAt)
                .toUTC()
                .toFormat('yyyyMMdd'),
            localTime: DateTime.fromJSDate(order.createdAt)
                .toUTC()
                .toFormat('HHmmss'),
            payerId: 0,
            callBackUrl: `${appBaseUrl}/order/webhook/${order.callbackId}`,
        });

        const [code, refId] = result[0].return.split(',');

        if (Number(code) === 0) {
            return {
                status: true,
                code: +code,
                message: '',
                orderStatus: OrderStatus.PENDING,
                refId,
            };
        }
        return {
            ...paymentGatewayTransformer(+code),
            refId: refId || null,
        };
    }

    async verifyPay(data: PaymentCallbackDto) {
        const result = await this.gatewayClient.bpVerifyRequestAsync({
            terminalId: this.paymentConf.terminalId,
            userName: this.paymentConf.username,
            userPassword: this.paymentConf.password,
            orderId: data.saleOrderId,
            saleOrderId: data.saleOrderId,
            saleReferenceId: data.SaleReferenceId,
        });
        return paymentGatewayTransformer(+result[0].return);
    }
}
