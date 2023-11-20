import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { SoapModule } from 'nestjs-soap';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Config } from 'src/config';

@Module({
    imports: [
        SoapModule.registerAsync({
            clientName: 'PAYMENT_GATEWAY',
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService<Config, true>) => {
                const url = configService.get('paymentGateway.wslUrl', {
                    infer: true,
                });
                return {
                    uri: url,
                };
            },
        }),
    ],
    providers: [PaymentService],
    exports: [PaymentService],
})
export class PaymentModule {}
