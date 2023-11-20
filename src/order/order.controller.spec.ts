import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { WalletService } from 'src/wallet/wallet.service';
import { PackageService } from 'src/package/package.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { DiscountCode } from './entity/discount.entity';
import { PaymentService } from 'src/payment/payment.service';
import { ConfigService } from '@nestjs/config';

describe('OrderController', () => {
    let controller: OrderController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrderController],
            providers: [
                OrderService,
                {
                    provide: getRepositoryToken(Order),
                    useValue: {},
                },
                {
                    provide: getRepositoryToken(DiscountCode),
                    useValue: {},
                },
                {
                    provide: WalletService,
                    useValue: {},
                },
                {
                    provide: PackageService,
                    useValue: {},
                },
                {
                    provide: PaymentService,
                    useValue: {},
                },
                {
                    provide: ConfigService,
                    useValue: {},
                },
            ],
        }).compile();

        controller = module.get<OrderController>(OrderController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
