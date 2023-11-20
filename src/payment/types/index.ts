import { Client } from 'nestjs-soap';

export type GatewayRawResponse = [
    { return: string },
    string,
    undefined,
    string,
    undefined,
];

export interface BaseArgsType {
    terminalId: string;
    userName: string;
    userPassword: string;
}

export interface PayRequestArgsType extends BaseArgsType {
    orderId: number;
    amount: number;
    localDate: string;
    localTime: string;
    payerId: number;
    callBackUrl: string;
    additionalData?: string;
}

export interface VerifyRequestArgsType extends BaseArgsType {
    orderId: number;
    saleOrderId: number;
    saleReferenceId: number;
}

export interface GatewayClient extends Client {
    bpPayRequestAsync: (
        args: PayRequestArgsType,
    ) => Promise<GatewayRawResponse>;

    bpVerifyRequestAsync: (
        args: VerifyRequestArgsType,
    ) => Promise<GatewayRawResponse>;
}
