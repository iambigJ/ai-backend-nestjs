import { CacheService } from './../cache/cache.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from './strategy/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import * as otpGenerator from 'otp-generator';
import { SmsService } from 'src/sms/sms.service';
import { hashPassword } from 'src/utils/hash';
import {
    AlreadyHaveAccountException,
    InvalidOtpException,
    OtpAlreadySendException,
    PasswordMissedException,
} from './exception/auth.exception';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private cacheService: CacheService,
        private smsService: SmsService,
    ) {}

    async verifyToken(token: string): Promise<boolean> {
        return this.jwtService
            .verifyAsync<JwtPayload>(token)
            .then((res) => true)
            .catch(() => false);
    }

    private async getValidatedUserFromCache(phone: string, otp: string) {
        const data = await this.cacheService.getUser(phone);
        if (data.otp !== otp) {
            throw new InvalidOtpException();
        }
        return data;
    }

    async validateUser(phone: string, password: string) {
        const user = await this.userService.findOne(phone);
        if (!user) {
            return null;
        }

        const isPasswordMath = await bcrypt.compare(password, user.password);
        if (isPasswordMath) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    public async login(user: Express.User) {
        const payload: JwtPayload = {
            sub: user.id,
        };
        const accessToken = await this.jwtService.signAsync(payload);
        return accessToken;
    }

    public async sendAndStoreOTP(phone: string, password?: string) {
        const user = await this.cacheService.getUser(phone);
        if (user) {
            throw new OtpAlreadySendException();
        }
        const otp = otpGenerator.generate(5, {
            digits: true,
            lowerCaseAlphabets: false,
            specialChars: false,
            upperCaseAlphabets: false,
        });
        await this.smsService.sendOtp(phone, otp);
        let hashedPassword: string;
        if (password) {
            hashedPassword = await hashPassword(password);
        }
        await this.cacheService.setUser(phone, { otp, hashedPassword });
    }

    public async resetPassword(phone: string, password: string, otp: string) {
        await this.getValidatedUserFromCache(phone, otp);
        const hashedPassword = await hashPassword(password);
        await this.userService.updatePassword(phone, hashedPassword);
    }

    public async signup(phone: string, otp: string) {
        const user = await this.getValidatedUserFromCache(phone, otp);
        if (!user.hashedPassword) {
            throw new PasswordMissedException();
        }
        try {
            const newUser = await this.userService.createOne(
                phone,
                user.hashedPassword,
            );
            return this.login({ id: newUser.id });
        } catch {
            throw new AlreadyHaveAccountException();
        }
    }
}
