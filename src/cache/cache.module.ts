import type { ClientOpts } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Config } from 'src/config';

@Module({
    imports: [
        CacheModule.registerAsync<ClientOpts>({
            useFactory: (configService: ConfigService<Config>) => {
                const conf: Config['redis'] = configService.get('redis');
                return {
                    store: redisStore,
                    host: conf.host,
                    port: conf.port,
                    db: conf.db,
                    password: conf.password,
                };
            },
            imports: [ConfigModule],
            inject: [ConfigService],
        }),
    ],
    providers: [CacheService],
    exports: [CacheService],
})
export class AppCacheModule {}
