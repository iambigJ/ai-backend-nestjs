import { paymentGatewayTransformer } from './../utils/payment';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { WalletService } from 'src/wallet/wallet.service';
import { PackageService } from 'src/package/package.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entity/order.entity';
import { DiscountCode } from './entity/discount.entity';
import { PaymentService } from 'src/payment/payment.service';
import {
    DeepPartial,
    IsNull,
    MoreThan,
    Repository,
    SelectQueryBuilder,
    UpdateQueryBuilder,
} from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { BadRequestException } from '@nestjs/common';
import { OrderNotFoundException } from './exception/order.exception';

jest.mock('typeorm-transactional', () => ({
    Transactional: () => () => ({}),
}));

describe('OrderService', () => {
    let orderService: OrderService;
    let packageService: PackageService;
    let walletService: WalletService;
    let paymentService: PaymentService;
    let orderRepository: Repository<Order>;
    let discountRepository: Repository<DiscountCode>;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                {
                    provide: getRepositoryToken(Order),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(DiscountCode),
                    useClass: Repository,
                },
                {
                    provide: WalletService,
                    useValue: {},
                },
                {
                    provide: PackageService,
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: PaymentService,
                    useValue: {
                        payRequest: jest.fn(),
                        verifyPay: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {},
                },
            ],
        }).compile();

        orderService = module.get<OrderService>(OrderService);
        packageService = module.get<PackageService>(PackageService);
        walletService = module.get<WalletService>(WalletService);
        paymentService = module.get<PaymentService>(PaymentService);
        orderRepository = module.get<Repository<Order>>(
            getRepositoryToken(Order),
        );
        discountRepository = module.get<Repository<DiscountCode>>(
            getRepositoryToken(DiscountCode),
        );
        // Mocking dependencies
    });

    describe('findOneDiscountCode', () => {
        it('should pass this values to where options', async () => {
            jest.spyOn(discountRepository, 'findOne').mockImplementation();
            jest.useFakeTimers({ now: new Date('2023-04-14T10:20:00Z') });
            await orderService.findOneDiscountCode('CODE');
            expect(discountRepository.findOne).toBeCalledWith({
                where: {
                    code: 'CODE',
                    expireAt: MoreThan(new Date('2023-04-14T10:20:00Z')),
                    maxUsage: MoreThan(0),
                    deletedAt: IsNull(),
                },
            });
        });
    });

    describe('updateDiscountCodeUsage', () => {
        beforeEach(() => {
            jest.spyOn(
                discountRepository,
                'createQueryBuilder',
            ).mockReturnValue({
                update: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                execute: jest.fn(),
            } as any);
        });

        it('should decrement maxUsage by 1', async () => {
            await orderService.updateDiscountCodeUsage(
                'DISCOUNT_ID',
                'decrement',
            );
            expect(
                discountRepository.createQueryBuilder().update().where,
            ).toBeCalledWith('id = :id', {
                id: 'DISCOUNT_ID',
            });
            expect(
                discountRepository.createQueryBuilder().update().set,
            ).toBeCalled();
        });

        it('should increment maxUsage by 1', async () => {
            await orderService.updateDiscountCodeUsage(
                'DISCOUNT_ID',
                'increment',
            );
            expect(
                discountRepository.createQueryBuilder().update().where,
            ).toBeCalledWith('id = :id', {
                id: 'DISCOUNT_ID',
            });
            expect(
                discountRepository.createQueryBuilder().update().set,
            ).toBeCalled();
        });
    });

    describe('updateExtraDetails', () => {
        beforeEach(() => {
            jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue({
                update: jest.fn().mockReturnThis(),
                set: jest
                    .fn()
                    .mockImplementation({ extraDetails: jest.fn() } as any)
                    .mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                execute: jest.fn(),
            } as any);
        });
        it('should create correct jsonb_set query', async () => {
            const orderId = 1;
            const details: Order['extraDetails'] = {
                card_holder_pan: 'card pan',
                message: 'message',
                sale_reference_id: 1,
            };
            await orderService.updateExtraDetails(orderId, details);
            const updateCardHolderQuery = `jsonb_set(extraDetails, '{card_holder_pan}','"card pan"')`;
            const updateMessageQuery = `jsonb_set(extraDetails, '{message}','"message"')`;
            const updateSaleReferenceIdQuery = `jsonb_set(extraDetails, '{sale_reference_id}','"1"')`;
        });
    });

    describe('calculateDiscountAmount', () => {
        it('should return zero if code does not exist', async () => {
            jest.spyOn(orderService, 'findOneDiscountCode').mockResolvedValue(
                null,
            );
            const amount = 100;
            const discountCode = 'CODE';
            const discountAmount = await orderService.calculateDiscountAmount(
                amount,
                discountCode,
            );
            expect(discountAmount).toBe(0);
        });

        it('should calculate discount amount', async () => {
            jest.spyOn(orderService, 'findOneDiscountCode').mockResolvedValue({
                percent: 30,
                maxPrice: 10000,
            } as DiscountCode);
            const amount = 10000;
            const discountCode = 'CODE';
            const discountAmount = await orderService.calculateDiscountAmount(
                amount,
                discountCode,
            );
            expect(discountAmount).toBe(3000);
        });
        it('should calculate discount amount', async () => {
            jest.spyOn(orderService, 'findOneDiscountCode').mockResolvedValue({
                percent: 30,
                maxPrice: 2000,
            } as DiscountCode);
            const amount = 10000;
            const discountCode = 'CODE';
            const discountAmount = await orderService.calculateDiscountAmount(
                amount,
                discountCode,
            );
            expect(discountAmount).toBe(2000);
        });
    });

    describe('getPaymentInvoice', () => {
        it('should calculate invoice', async () => {
            jest.spyOn(packageService, 'findOne').mockResolvedValue({
                id: 'id',
                price: 10000,
            });
            jest.spyOn(
                orderService,
                'calculateDiscountAmount',
            ).mockResolvedValue(100);
            const invoice = await orderService.getPaymentInvoice({
                packageId: 'id',
                discountCode: 'code',
            });
            expect(invoice).toStrictEqual({
                package: { id: 'id', price: 10000 },
                price: 10000,
                tax: 900,
                discountAmount: 100,
                payableAmount: 10800,
            });
        });

        it('should calculate invoice when discount code is not provided', async () => {
            jest.spyOn(packageService, 'findOne').mockResolvedValue({
                id: 'id',
                price: 10000,
            });
            jest.spyOn(
                orderService,
                'calculateDiscountAmount',
            ).mockResolvedValue(100);
            const invoice = await orderService.getPaymentInvoice({
                packageId: 'id',
            });
            expect(invoice).toStrictEqual({
                package: { id: 'id', price: 10000 },
                price: 10000,
                tax: 900,
                discountAmount: 0,
                payableAmount: 10900,
            });
        });
    });

    describe('createOrder', () => {
        beforeEach(async () => {
            jest.spyOn(orderService, 'getPaymentInvoice').mockResolvedValue({
                package: {
                    id: 'uuid',
                    price: 100,
                    orders: [],
                    walletPackages: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    credit: 10,
                    expirationDuration: 10,
                    maxImageUploadSize: 10,
                    maxPdfUploadSize: 10,
                    title: 'adad',
                },
                tax: 9,
                price: 1,
                discountAmount: 5,
                payableAmount: 104,
            });
            jest.spyOn(orderService, 'findOneDiscountCode').mockResolvedValue({
                id: 'DISCOUNT_ID',
                code: 'DISCOUNT_CODE',
                createdAt: new Date(),
                updatedAt: new Date(),
                percent: 10,
                maxPrice: 100,
                orders: [],
                maxUsage: 10,
                expireAt: new Date(),
                deletedAt: new Date(),
            });
            jest.spyOn(orderRepository, 'create').mockImplementation(
                () => new Order(),
            );
            jest.spyOn(orderRepository, 'save').mockResolvedValue({
                id: 1,
                discountCode: {
                    id: 'DISCOUNT_ID',
                    code: 'DISCOUNT_CODE',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    percent: 10,
                    maxPrice: 100,
                    orders: [],
                    maxUsage: 10,
                    expireAt: new Date(),
                    deletedAt: new Date(),
                },
            } as Order);
            jest.spyOn(orderRepository, 'update').mockImplementation();
            jest.spyOn(orderService, 'updateExtraDetails').mockResolvedValue(
                undefined,
            );
            jest.spyOn(
                orderService,
                'updateDiscountCodeUsage',
            ).mockResolvedValue(undefined);
        });

        it('should create a new order with a valid PaymentInvoiceDto and successful payment', async () => {
            jest.spyOn(paymentService, 'payRequest').mockResolvedValue({
                refId: 'REF_ID',
                code: 0,
                orderStatus: OrderStatus.PENDING,
                message: '',
                status: true,
            });

            // Test
            const result = await orderService.createOrder('USER_ID', {
                packageId: 'package_id',
            });
            expect(orderRepository.update).toBeCalledWith(1, {
                refId: 'REF_ID',
                gatewayCode: 0,
                status: OrderStatus.PENDING,
            });

            // Assertions
            expect(result).toEqual({
                refId: 'REF_ID',
                code: 0,
                orderStatus: OrderStatus.PENDING,
                status: true,
                message: '',
            });
        });

        it('should handle a new order with a valid PaymentInvoiceDto and failed payment', async () => {
            // Mocking dependencies
            jest.spyOn(paymentService, 'payRequest').mockResolvedValue({
                refId: 'REF_ID',
                code: 21,
                orderStatus: OrderStatus.FAILED,
                message: '',
                status: false,
            });

            // Test
            const result = await orderService.createOrder('USER_ID', {
                packageId: 'package_id',
            });
            expect(orderRepository.update).toBeCalledWith(1, {
                refId: 'REF_ID',
                gatewayCode: 21,
                status: OrderStatus.FAILED,
            });

            // Assertions
            expect(result).toEqual({
                refId: 'REF_ID',
                code: 21,
                orderStatus: OrderStatus.FAILED,
                message: '',
                status: false,
            });
        });
    });

    describe('getPaymentGatewayUrl', () => {});

    describe('handlePaidPayment', () => {});

    describe('handleFailedPayment', () => {});

    describe('verifyOrder', () => {
        beforeEach(async () => {
            jest.useFakeTimers({ now: new Date('2023-04-14T10:20:00Z') });
        });
        it('should get the 20 minutes ago date accurately', async () => {
            jest.spyOn(orderRepository, 'findOneOrFail');
            jest.spyOn(orderRepository, 'findOne').mockImplementation(() =>
                Promise.resolve(new Order()),
            );
            await orderService.shouldVerifyOrder(1);
            expect(orderRepository.findOneOrFail).toBeCalledWith({
                where: {
                    id: 1,
                    updatedAt: MoreThan(new Date('2023-04-14T10:00:00Z')),
                },
            });
        });

        it('should verify payment and call the handlePaidPayment', async () => {
            const orderId = 1;
            const SaleReferenceId = 1;
            // Mocking dependencies
            jest.spyOn(orderService, 'shouldVerifyOrder').mockResolvedValue(
                true,
            );
            jest.spyOn(paymentService, 'verifyPay').mockResolvedValue({
                ...paymentGatewayTransformer(0),
            });
            jest.spyOn(orderService, 'handlePaidPayment').mockImplementation();
            jest.spyOn(orderService, 'getRedirectUrl').mockImplementation();

            // Test
            await orderService.verifyPaymentAndGetUrl(orderId, {
                SaleReferenceId,
                RefId: 'REF123',
                ResCode: paymentGatewayTransformer(0),
                saleOrderId: orderId,
                CardHolderPAN: 'PAN',
                CreditCardSaleResponseDetail: '',
                FinalAmount: 1,
            });

            // Assertions
            expect(orderService.handlePaidPayment).toBeCalledWith(
                paymentGatewayTransformer(0),
                orderId,
            );
            expect(orderService.getRedirectUrl).toBeCalledWith(
                SaleReferenceId,
                paymentGatewayTransformer(0),
            );
        });

        it('should verify payment and if reversed/canceled call the handleFailedPayment', async () => {
            // Mocking dependencies
            const orderId = 1;
            const SaleReferenceId = 1;
            // Mocking dependencies
            jest.spyOn(orderService, 'shouldVerifyOrder').mockResolvedValue(
                true,
            );
            jest.spyOn(paymentService, 'verifyPay').mockResolvedValue({
                ...paymentGatewayTransformer(48),
            });
            jest.spyOn(
                orderService,
                'handleFailedPayment',
            ).mockImplementation();
            jest.spyOn(orderService, 'getRedirectUrl').mockImplementation();

            // Test
            await orderService.verifyPaymentAndGetUrl(orderId, {
                SaleReferenceId,
                RefId: 'REF123',
                ResCode: paymentGatewayTransformer(0),
                saleOrderId: orderId,
                CardHolderPAN: 'PAN',
                CreditCardSaleResponseDetail: '',
                FinalAmount: 1,
            });

            expect(orderService.handleFailedPayment).toBeCalledWith(
                paymentGatewayTransformer(48),
                orderId,
            );
            expect(orderService.getRedirectUrl).toBeCalledWith(
                SaleReferenceId,
                paymentGatewayTransformer(48),
            );
            jest.spyOn(paymentService, 'verifyPay').mockResolvedValue({
                ...paymentGatewayTransformer(17),
            });
            await orderService.verifyPaymentAndGetUrl(orderId, {
                SaleReferenceId,
                RefId: 'REF123',
                ResCode: paymentGatewayTransformer(0),
                saleOrderId: orderId,
                CardHolderPAN: 'PAN',
                CreditCardSaleResponseDetail: '',
                FinalAmount: 1,
            });
            expect(orderService.handleFailedPayment).toBeCalledWith(
                paymentGatewayTransformer(17),
                orderId,
            );
            expect(orderService.getRedirectUrl).toBeCalledWith(
                SaleReferenceId,
                paymentGatewayTransformer(17),
            );
        });

        it('should verify payment and if the gateway status is not ok retry in 1 minute', async () => {
            // Mocking dependencies
            const orderId = 1;
            const SaleReferenceId = 1;
            const dto = {
                SaleReferenceId,
                RefId: 'REF123',
                ResCode: paymentGatewayTransformer(0),
                saleOrderId: orderId,
                CardHolderPAN: 'PAN',
                CreditCardSaleResponseDetail: '',
                FinalAmount: 1,
            };
            // Mocking dependencies
            jest.spyOn(orderService, 'shouldVerifyOrder').mockResolvedValue(
                true,
            );
            jest.spyOn(paymentService, 'verifyPay').mockResolvedValue({
                ...paymentGatewayTransformer(18),
            });
            jest.spyOn(
                orderService,
                'handleFailedPayment',
            ).mockImplementation();
            jest.spyOn(orderService, 'getRedirectUrl').mockImplementation();

            // Mocking setTimeout
            jest.useFakeTimers();

            // Test
            const result = await orderService.verifyPaymentAndGetUrl(
                orderId,
                dto,
            );

            // Assertions
            // expect(setTimeout).toBeCalled();
            expect(orderService.getRedirectUrl).toHaveBeenCalledWith(
                SaleReferenceId,
                paymentGatewayTransformer(18),
            );

            // Fast-forward time to trigger setTimeout
            jest.spyOn(
                orderService,
                'verifyPaymentAndGetUrl',
            ).mockImplementation();
            await jest.runAllTimersAsync();

            // Assertions after the delay
            expect(orderService.verifyPaymentAndGetUrl).toHaveBeenCalledWith(
                orderId,
                dto,
            );
        });
    });

    describe('gatewayCallback', () => {
        beforeEach(() => {
            jest.spyOn(orderService, 'updateExtraDetails').mockImplementation();
            jest.spyOn(
                orderService,
                'handleFailedPayment',
            ).mockImplementation();
            jest.spyOn(orderService, 'getRedirectUrl').mockImplementation();
            jest.spyOn(
                orderService,
                'verifyPaymentAndGetUrl',
            ).mockImplementation();
        });

        it('should throw error code 400 if the refId or callbackId or orderId is not correct', async () => {
            jest.spyOn(orderRepository, 'findOne').mockResolvedValue(null);
            await expect(
                orderService.handleGatewayCallback('CALLBACK_ID', {
                    RefId: 'REF_ID',
                    ResCode: paymentGatewayTransformer(0),
                    saleOrderId: 1,
                } as PaymentCallbackDto),
            ).rejects.toThrowError(OrderNotFoundException);
        });
        it('should update order as failed payment if status is not ok', async () => {
            jest.spyOn(orderRepository, 'findOne').mockResolvedValue({
                id: 1,
            } as Order);
            await orderService.handleGatewayCallback('CALLBACK_ID', {
                RefId: 'REF_ID',
                ResCode: paymentGatewayTransformer(11),
                saleOrderId: 1,
                SaleReferenceId: 1,
                CardHolderPAN: 'PAN',
            } as PaymentCallbackDto);

            expect(orderService.updateExtraDetails).toBeCalledWith(1, {
                sale_reference_id: 1,
                card_holder_pan: 'PAN',
            });

            expect(orderService.handleFailedPayment).toBeCalledWith(
                paymentGatewayTransformer(11),
                1,
            );
            expect(orderService.getRedirectUrl).toBeCalledWith(
                1,
                paymentGatewayTransformer(11),
            );
        });
        it('should call verifyPayment method if status is ok', async () => {
            jest.spyOn(orderRepository, 'findOne').mockResolvedValue({
                id: 1,
            } as Order);
            const dto = {
                RefId: 'REF_ID',
                ResCode: paymentGatewayTransformer(0),
                saleOrderId: 1,
                SaleReferenceId: 1,
                CardHolderPAN: 'PAN',
            } as PaymentCallbackDto;
            await orderService.handleGatewayCallback('CALLBACK_ID', dto);

            expect(orderService.updateExtraDetails).toBeCalledWith(1, {
                sale_reference_id: 1,
                card_holder_pan: 'PAN',
            });
            expect(orderService.verifyPaymentAndGetUrl).toBeCalledWith(1, dto);
        });
    });
});
