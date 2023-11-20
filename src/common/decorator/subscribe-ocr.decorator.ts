import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import * as dotenv from 'dotenv';

export function getSubscribeOcrDecorator(): ReturnType<typeof RabbitSubscribe> {
    // Question: How we can use DI here ?!
    dotenv.config();
    const exchange = process.env.RABBITMQ_EXCHANGE || '';
    const routingKey = process.env.RABBITMQ_ROUTING_KEY || '';
    const queue = process.env.RABBITMQ_RESULT_QUEUE;

    return RabbitSubscribe({
        exchange,
        routingKey,
        queue,
        queueOptions: {
            durable: true,
        },
        createQueueIfNotExists: true,
    });
}
