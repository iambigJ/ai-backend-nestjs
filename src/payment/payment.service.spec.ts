import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';
import {
    PaymentGatewayResponse,
    paymentGatewayTransformer,
} from '../utils/payment';
import { Order, OrderStatus } from '../order/entity/order.entity';
import { PaymentCallbackDto } from '../order/dto/payment-callback.dto';
import { GatewayClient } from './types';

// Mock the GatewayClient
const gatewayClientMock: jest.Mocked<
    Pick<GatewayClient, 'bpPayRequestAsync' | 'bpVerifyRequestAsync'>
> = {
    bpPayRequestAsync: jest.fn(),
    bpVerifyRequestAsync: jest.fn(),
};

// Mock the ConfigService
const configServiceMock = {
    get: (key) => configMock[key],
};

// Mock the Config
const configMock = {
    paymentGateway: {
        terminalId: 'mockTerminalId',
        username: 'mockUsername',
        password: 'mockPassword',
    },
    appBaseUrl: 'mockAppBaseUrl',
};

describe('PaymentService', () => {
    let paymentService: PaymentService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentService,
                { provide: 'PAYMENT_GATEWAY', useValue: gatewayClientMock },
                { provide: ConfigService, useValue: configServiceMock },
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(configServiceMock)
            .compile();

        paymentService = module.get<PaymentService>(PaymentService);
    });

    describe('payRequest', () => {
        it('should return a successful payment response', async () => {
            jest.useFakeTimers({ now: new Date('2023-04-14T10:20:00Z') });
            // Mocking necessary data
            const order: Partial<Order> = {
                id: 1,
                payAmount: 100,
                createdAt: new Date(),
                callbackId: 'mockCallbackId',
            };

            const expectedResult: PaymentGatewayResponse & { refId: string } = {
                status: true,
                code: 0,
                message: '',
                orderStatus: OrderStatus.PENDING,
                refId: 'RID',
            };

            // Mocking ConfigService

            // Mocking GatewayClient
            gatewayClientMock.bpPayRequestAsync.mockResolvedValue([
                { return: '0,RID' },
                'string',
                undefined,
                'string',
                undefined,
            ]);

            // Perform the payRequest
            const result = await paymentService.payRequest(order as Order);

            // Assertions
            expect(result).toEqual(expectedResult);
            expect(gatewayClientMock.bpPayRequestAsync).toHaveBeenCalledWith({
                terminalId: 'mockTerminalId',
                userName: 'mockUsername',
                userPassword: 'mockPassword',
                orderId: 1,
                amount: 100,
                localDate: '20230414',
                localTime: '102000',
                payerId: 0,
                callBackUrl: 'mockAppBaseUrl/order/webhook/mockCallbackId',
            });
        });
    });

    describe('verifyPay', () => {
        it('should return a payment verification result', async () => {
            // Mocking necessary data
            const paymentCallbackDto: PaymentCallbackDto = {
                saleOrderId: 1,
                SaleReferenceId: 2,
                CardHolderPAN: '',
                CreditCardSaleResponseDetail: '',
                FinalAmount: 3,
                RefId: '',
                ResCode: paymentGatewayTransformer(0),
            };

            const expectedResult = paymentGatewayTransformer(0);

            // Mocking ConfigService
            // configServiceMock.get.mockImplementation((key) => configMock[key]);

            // Mocking GatewayClient
            gatewayClientMock.bpVerifyRequestAsync.mockResolvedValue([
                { return: '0' },
                '',
                undefined,
                'string',
                undefined,
            ]);

            // Perform the verifyPay
            const result = await paymentService.verifyPay(paymentCallbackDto);

            // Assertions
            expect(result).toEqual(expectedResult);
            expect(gatewayClientMock.bpVerifyRequestAsync).toHaveBeenCalledWith(
                {
                    terminalId: 'mockTerminalId',
                    userName: 'mockUsername',
                    userPassword: 'mockPassword',
                    orderId: paymentCallbackDto.saleOrderId,
                    saleOrderId: paymentCallbackDto.saleOrderId,
                    saleReferenceId: paymentCallbackDto.SaleReferenceId,
                },
            );
        });
    });
});
