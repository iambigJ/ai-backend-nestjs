export default (): Config => ({
    env: process.env.NODE_ENV || 'production',
    secret: process.env.SECRET,
    appBaseUrl: process.env.APP_BASE_URL,
    paymentGateway: {
        wslUrl: process.env.PAYMENT_WSL_URL,
        gatewayUrl: process.env.PAYMENT_GATEWAY_URL,
        redirectAfterPaymentUrl: process.env.REDIRECT_AFTER_PAYMENT_URL,
        terminalId: process.env.PAYMENT_TERMINAL_ID,
        username: process.env.PAYMENT_USERNAME,
        password: process.env.PAYMENT_PASSWORD,
    },
    postgres: {
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
        db: process.env.POSTGRES_DB,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB, 10) || 1,
    },
    kavenegar: {
        apiKey: process.env.KAVENEGAR_API_KEY,
        template: process.env.KAVENEGAR_TEMPLATE,
    },
    rabbitMQ: {
        host: process.env.RABBITMQ_HOST,
        port: parseInt(process.env.RABBITMQ_PORT, 10) || 5672,
        username: process.env.RABBITMQ_USERNAME,
        password: process.env.RABBITMQ_PASSWORD,
        taskQueue: process.env.RABBITMQ_TASK_QUEUE,
        resultQueue: process.env.RABBITMQ_RESULT_QUEUE,
        exchange: process.env.RABBITMQ_EXCHANGE || '',
        routingKey: process.env.RABBITMQ_ROUTING_KEY || '',
    },
});

export interface Config {
    env: string;
    secret: string;
    appBaseUrl: string;
    paymentGateway: {
        wslUrl: string;
        gatewayUrl: string;
        redirectAfterPaymentUrl: string;
        terminalId: string;
        username: string;
        password: string;
    };
    postgres: {
        host: string;
        port: number;
        db: string;
        user: string;
        password: string;
    };
    redis: {
        host: string;
        port: number;
        password: string;
        db: number;
    };
    kavenegar: {
        apiKey: string;
        template: string;
    };
    rabbitMQ: {
        host: string;
        port: number;
        username: string;
        password: string;
        taskQueue: string;
        resultQueue: string;
        exchange: string;
        routingKey: string;
    };
}
