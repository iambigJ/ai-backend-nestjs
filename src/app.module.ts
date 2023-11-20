import { AppCacheModule } from './cache/cache.module';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { Config } from './config';
import { SmsModule } from './sms/sms.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletModule } from './wallet/wallet.module';
import { PackageModule } from './package/package.module';
import { DocumentModule } from './document/document.module';
import { OrderModule } from './order/order.module';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ContactModule } from './contact/contact.module';
import { PaymentModule } from './payment/payment.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true,
            load: [configuration],
        }),
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService<Config>) => {
                const conf = configService.get<Config['postgres']>('postgres');
                const env = configService.get<string>('env');
                return {
                    type: 'postgres',
                    logging: env === 'development',
                    host: conf.host,
                    port: conf.port,
                    username: conf.user,
                    password: conf.password,
                    database: conf.db,
                    autoLoadEntities: true,
                    synchronize: env === 'development',
                };
            },
            async dataSourceFactory(options) {
                if (!options) {
                    throw new Error('Invalid options passed');
                }

                return addTransactionalDataSource(new DataSource(options));
            },

            imports: [ConfigModule],
            inject: [ConfigService],
        }),
        EventEmitterModule.forRoot(),
        AppCacheModule,
        UserModule,
        AuthModule,
        SmsModule,
        WalletModule,
        PackageModule,
        DocumentModule,
        OrderModule,
        ContactModule,
        PaymentModule,
    ],
})
export class AppModule {}
