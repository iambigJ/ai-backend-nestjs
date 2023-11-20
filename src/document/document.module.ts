import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entity/document.entity';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { WalletModule } from 'src/wallet/wallet.module';
import { DocumentConsumer } from './document.consumer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Config } from 'src/config';
import { DocumentGateway } from './document.gateway';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { DocumentSubscriber } from './document.subscriber';

@Module({
    imports: [
        AuthModule,
        TypeOrmModule.forFeature([Document]),
        RabbitMQModule.forRootAsync(RabbitMQModule, {
            useFactory: (configService: ConfigService<Config, true>) => {
                const conf = configService.get('rabbitMQ', {
                    infer: true,
                });
                return {
                    uri: `amqp://${conf.username}:${conf.password}@${conf.host}:${conf.port}`,
                    connectionInitOptions: { wait: false },
                };
            },
            imports: [ConfigModule],
            inject: [ConfigService],
        }),
        WalletModule,
    ],
    controllers: [DocumentController],
    providers: [
        DocumentService,
        DocumentConsumer,
        DocumentGateway,
        DocumentSubscriber,
    ],
})
export class DocumentModule {}
