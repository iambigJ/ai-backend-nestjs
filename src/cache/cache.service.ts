import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

type PreregisterUser = {
    hashedPassword?: string;
    otp: string;
};

const OTP_BASE_KEY = 'otp';

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async setUser(phone: string, data: PreregisterUser) {
        const key = `${OTP_BASE_KEY}:${phone}`;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.cacheManager.set(key, JSON.stringify(data), { ttl: 120 });
    }

    async getUser(phone: string): Promise<PreregisterUser> {
        const key = `${OTP_BASE_KEY}:${phone}`;
        return this.cacheManager
            .get<string>(key)
            .then((value) => JSON.parse(value) as PreregisterUser);
    }

    async deleteUser(phone: string) {
        const key = `${OTP_BASE_KEY}:${phone}`;
        return this.cacheManager.del(key);
    }
}
