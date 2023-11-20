import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PaymentInvoiceDto {
    @IsString()
    @IsNotEmpty()
    packageId: string;

    @IsOptional()
    @IsString()
    discountCode?: string;
}
