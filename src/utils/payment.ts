import { OrderStatus } from 'src/order/entity/order.entity';

export type PaymentGatewayResponse = {
    status: boolean;
    orderStatus: OrderStatus | null;
    code: number;
    message: string;
};

export const paymentGatewayTransformer = (
    code: number,
): PaymentGatewayResponse => {
    switch (code) {
        case 0:
            return {
                status: true,
                orderStatus: OrderStatus.PAID,
                code,
                message: 'تراکنش با موفقيت انجام شد',
            };
        case 43:
            return {
                status: true,
                orderStatus: OrderStatus.PAID,
                code,
                message: 'قبال درخواست Verify داده شده است',
            };
        case 45:
            return {
                status: true,
                orderStatus: OrderStatus.PAID,
                code,
                message: 'تراکنش Settle شده است',
            };
        case 11:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'شماره کارت نامعتبر است',
            };
        case 12:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'موجودی کافي نيست',
            };
        case 13:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'رمز نادرست است',
            };
        case 14:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'تعداد دفعات وارد کردن رمز بيش از حد مجاز است',
            };

        case 15:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'کارت نامعتبر است',
            };
        case 16:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'دفعات برداشت وجه بيش از حد مجاز است',
            };
        case 17:
            return {
                status: false,
                orderStatus: OrderStatus.CANCELLED,
                code,
                message: 'کاربر از انجام تراکنش منصرف شده است',
            };
        case 18:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'تاريخ انقضای کارت گذشته است',
            };
        case 19:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'مبلغ برداشت وجه بيش از حد مجاز است',
            };

        case 111:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'صادر کننده کارت نامعتبر است',
            };
        case 112:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'خطای سوييچ صادر کننده کارت',
            };
        case 113:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'پاسخي از صادر کننده کارت دريافت نشد',
            };
        case 114:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'دارنده کارت مجاز به انجام اين تراکنش نيست',
            };
        case 21:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'پذيرنده نامعتبر است',
            };
        case 23:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'خطای امنيتي رخ داده است',
            };
        case 24:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'اطالعات کاربری پذيرنده نامعتبر است',
            };
        case 25:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'مبلغ نامعتبر است',
            };
        case 31:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'پاسخ نامعتبر است',
            };
        case 32:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'فرمت اطالعات وارد شده صحيح نمي باشد',
            };
        case 33:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'حساب نامعتبر است',
            };
        case 34:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'خطای سيستمي',
            };
        case 35:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'تاريخ نامعتبر است',
            };
        case 41:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'شماره درخواست تکراری است',
            };
        case 42:
            return {
                status: false,
                code,
                orderStatus: OrderStatus.FAILED,
                message: 'تراکنش Sale يافت نشد',
            };

        case 44:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'درخواست Verfiy يافت نشد',
            };
        case 46:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'تراکنش Settle نشده است',
            };
        case 47:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'تراکنش Settle يافت نشد',
            };
        case 48:
            return {
                status: false,
                orderStatus: OrderStatus.REVERSED,
                code,
                message: 'تراکنش Reverse شده است',
            };
        case 412:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'شناسه قبض نادرست است',
            };
        case 413:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'شناسه پرداخت نادرست است',
            };
        case 414:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'سازمان صادر کننده قبض نامعتبر است',
            };
        case 415:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'زمان جلسه کاری به پايان رسيده است',
            };
        case 416:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'خطا در ثبت اطالعات',
            };
        case 417:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'شناسه پرداخت کننده نامعتبر است',
            };
        case 418:
            return {
                status: false,
                code,
                orderStatus: OrderStatus.FAILED,
                message: 'اشکال در تعريف اطالعات مشتری',
            };
        case 419:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'تعداد دفعات ورود اطالعات از حد مجاز گذشته است',
            };
        case 421:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: ' IPنامعتبر است',
            };
        case 51:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'تراکنش تکراری است',
            };
        case 54:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'تراکنش مرجع موجود نيست',
            };
        case 55:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'تراکنش نامعتبر است',
            };
        case 61:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: 'خطا در واريز',
            };
        case 62:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: '',
            };
        case 98:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code,
                message: '',
            };
        default:
            return {
                status: false,
                orderStatus: OrderStatus.FAILED,
                code: -1,
                message: 'Unexpected Error',
            };
    }
};
