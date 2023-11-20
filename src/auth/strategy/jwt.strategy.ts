import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config';
import { extractJwt } from 'src/utils/extract-jwt';

export type JwtPayload = { sub: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService<Config>) {
        super({
            jwtFromRequest: extractJwt,
            ignoreExpiration: false,
            secretOrKey: configService.get('secret'),
        });
    }

    async validate(payload: JwtPayload) {
        return { id: payload.sub };
    }
}
