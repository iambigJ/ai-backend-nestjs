import { Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import {
    PaymentGatewayResponse,
    paymentGatewayTransformer,
} from 'src/utils/payment';

export class PaymentCallbackDto {
    @IsString()
    RefId: string;

    @Transform(({ value }) => {
        const code = +value;
        return paymentGatewayTransformer(code);
    })
    ResCode: PaymentGatewayResponse;

    @IsNumber()
    saleOrderId: number;

    @IsNumber()
    SaleReferenceId: number;

    @IsString()
    CardHolderPAN: string;

    @IsString()
    CreditCardSaleResponseDetail: string;

    @IsNumber()
    FinalAmount: number;
}
