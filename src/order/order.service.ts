import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entity/order.entity';
import { IsNull, MoreThan, Repository, UpdateQueryBuilder } from 'typeorm';
import { DiscountCode } from './entity/discount.entity';
import { PackageService } from 'src/package/package.service';
import { PaymentInvoiceDto } from './dto/payment-invoice.dto';
import { Package } from 'src/package/entity/package.entity';
import { WalletService } from 'src/wallet/wallet.service';
import { Transactional } from 'typeorm-transactional';
import { PaymentService } from 'src/payment/payment.service';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config';
import { PaymentGatewayResponse } from 'src/utils/payment';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import {
    GatewayErrorException,
    OrderNotFoundException,
} from './exception/order.exception';

type InvoiceResponse = {
    package: Package;
    price: number;
    tax: number;
    discountAmount: number;
    payableAmount: number;
};

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order) private orderRepository: Repository<Order>,
        @InjectRepository(DiscountCode)
        private discountRepository: Repository<DiscountCode>,
        private packageService: PackageService,
        private walletService: WalletService,
        private paymentService: PaymentService,
        private configService: ConfigService<Config>,
    ) {}

    async findOneDiscountCode(code: string) {
        return this.discountRepository.findOne({
            where: {
                code,
                expireAt: MoreThan(new Date()),
                maxUsage: MoreThan(0),
                deletedAt: IsNull(),
            },
        });
    }

    async updateDiscountCodeUsage(
        discountId: string,
        action: 'increment' | 'decrement',
    ) {
        const setQuery =
            action === 'increment' ? 'maxUsage + 1' : 'maxUsage - 1';

        await this.discountRepository
            .createQueryBuilder()
            .update()
            .set({
                maxUsage: () => setQuery,
            })
            .where('id = :id', { id: discountId })
            .execute();
    }

    @Transactional()
    async updateExtraDetails(orderId: number, details: Order['extraDetails']) {
        const queries: Array<UpdateQueryBuilder<Order>> = [];
        for (const key in details) {
            if (Object.prototype.hasOwnProperty.call(details, key)) {
                const value = details[key];
                const qb = this.orderRepository
                    .createQueryBuilder()
                    .update()
                    .set({
                        extraDetails: () =>
                            `jsonb_set(extraDetails, '{${key}}','"${value}"')`,
                    })
                    .where('id = :orderId', { orderId });
                queries.push(qb);
            }
        }

        await Promise.all(queries.map((qb) => qb.execute()));
    }

    async calculateDiscountAmount(amount: number, discountCode: string) {
        const discount = await this.findOneDiscountCode(discountCode);

        if (!discount) {
            return 0;
        }

        return Math.min((amount * discount.percent) / 100, discount.maxPrice);
    }

    async getPaymentInvoice(data: PaymentInvoiceDto): Promise<InvoiceResponse> {
        const selectedPackage = await this.packageService.findOne(
            data.packageId,
        );
        const tax = selectedPackage.price * 0.09;
        let discountAmount = 0;
        if (data.discountCode) {
            discountAmount = await this.calculateDiscountAmount(
                selectedPackage.price,
                data.discountCode,
            );
        }
        return {
            package: selectedPackage,
            price: selectedPackage.price,
            tax,
            discountAmount,
            payableAmount: selectedPackage.price + tax - discountAmount,
        };
    }

    @Transactional()
    async createOrder(userId: string, data: PaymentInvoiceDto) {
        const invoice = await this.getPaymentInvoice(data);
        const discount = await this.findOneDiscountCode(data.discountCode);

        const orderInstance = this.orderRepository.create({
            package: {
                id: invoice.package.id,
            },
            tax: invoice.tax,
            discountAmount: invoice.discountAmount,
            payAmount: invoice.payableAmount,
            ...(discount ? { discountCode: { id: discount.id } } : {}),
            packagePrice: invoice.package.price,
            status: OrderStatus.PENDING,
            user: { id: userId },
        });
        const order = await this.orderRepository.save(orderInstance);
        const result = await this.paymentService.payRequest(order);
        await this.orderRepository.update(order.id, {
            refId: result.refId,
            gatewayCode: result.code,
            status: result.status ? OrderStatus.PENDING : OrderStatus.FAILED,
        });
        await this.updateExtraDetails(order.id, { message: result.message });
        if (order.discountCode) {
            this.updateDiscountCodeUsage(discount.id, 'decrement');
        }
        return result;
    }

    public async getPaymentGatewayUrl(userId: string, data: PaymentInvoiceDto) {
        const gatewayUrl = this.configService.get('paymentGateway.gatewayUrl', {
            infer: true,
        });
        const result = await this.createOrder(userId, data);
        if (!result.status) {
            throw new GatewayErrorException();
        }
        return `${gatewayUrl}?RefId=${result.refId}`;
    }

    @Transactional()
    async handlePaidPayment(response: PaymentGatewayResponse, orderId: number) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['package', 'discountCode', 'user'],
        });
        await this.orderRepository.update(orderId, {
            extraDetails: { message: response.message },
            status: response.orderStatus,
            gatewayCode: response.code,
        });
        await this.walletService.deposit(
            order.user.id,
            order.package.credit,
            orderId,
        );
        await this.walletService.createWalletPackage(
            order.user.id,
            order.package.id,
        );
    }
    @Transactional()
    async handleFailedPayment(
        response: PaymentGatewayResponse,
        orderId: number,
    ) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['package', 'discountCode', 'user'],
        });
        if (order.discountCode) {
            await this.updateDiscountCodeUsage(
                order.discountCode.id,
                'increment',
            );
        }

        await this.orderRepository.update(orderId, {
            extraDetails: {
                message: response.message,
            },
            status: response.orderStatus,
        });
    }
    getRedirectUrl(saleReferenceId: number, data: PaymentGatewayResponse) {
        const { message, status } = data;
        const baseUrl = this.configService.get(
            'paymentGateway.redirectAfterPaymentUrl',
            {
                infer: true,
            },
        );
        return `${baseUrl}?sale_reference_id=${saleReferenceId}&message=${message}&status=${status}`;
    }

    async shouldVerifyOrder(orderId: number) {
        const twentyMinuteAgo = new Date();
        twentyMinuteAgo.setSeconds(twentyMinuteAgo.getSeconds() - 20 * 60);
        return this.orderRepository
            .findOneOrFail({
                where: { id: orderId, updatedAt: MoreThan(twentyMinuteAgo) },
            })
            .then(() => true)
            .catch(() => false);
    }

    async verifyPaymentAndGetUrl(orderId: number, data: PaymentCallbackDto) {
        const shouldVerifyOrder = await this.shouldVerifyOrder(orderId);
        if (!shouldVerifyOrder) {
            await this.handleFailedPayment(data.ResCode, orderId);
            return this.getRedirectUrl(data.SaleReferenceId, data.ResCode);
        }
        const verifyResult = await this.paymentService.verifyPay(data);
        if (
            verifyResult.orderStatus === OrderStatus.CANCELLED ||
            verifyResult.orderStatus === OrderStatus.REVERSED
        ) {
            await this.handleFailedPayment(verifyResult, orderId);
            return this.getRedirectUrl(data.SaleReferenceId, verifyResult);
        }

        if (!verifyResult.status) {
            setTimeout(async () => {
                await this.verifyPaymentAndGetUrl(orderId, data);
            }, 60 * 1000);
            return this.getRedirectUrl(data.SaleReferenceId, verifyResult);
        }

        await this.handlePaidPayment(verifyResult, orderId);
        return this.getRedirectUrl(data.SaleReferenceId, verifyResult);
    }

    async handleGatewayCallback(callbackId: string, data: PaymentCallbackDto) {
        const order = await this.orderRepository.findOne({
            where: { callbackId, refId: data.RefId, id: data.saleOrderId },
        });
        if (!order) {
            throw new OrderNotFoundException();
        }

        await this.updateExtraDetails(order.id, {
            sale_reference_id: data.SaleReferenceId,
            card_holder_pan: data.CardHolderPAN,
        });

        if (!data.ResCode.status) {
            await this.handleFailedPayment(data.ResCode, order.id);
            return this.getRedirectUrl(data.SaleReferenceId, data.ResCode);
        }

        return this.verifyPaymentAndGetUrl(order.id, data);
    }
}
