import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'phone',
            passwordField: 'password',
        });
    }

    async validate(phone: string, password: string) {
        const user = await this.authService.validateUser(phone, password);
        if (!user) {
            throw new BadRequestException();
        }
        return user;
    }
}
