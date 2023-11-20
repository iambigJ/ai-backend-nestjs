import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountCode } from './entity/discount.entity';
import { Order } from './entity/order.entity';
import { PackageModule } from 'src/package/package.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { SoapModule, Client } from 'nestjs-soap';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([DiscountCode, Order]),
        PackageModule,
        WalletModule,
        PaymentModule,
    ],
    controllers: [OrderController],
    providers: [OrderService],
})
export class OrderModule {}
