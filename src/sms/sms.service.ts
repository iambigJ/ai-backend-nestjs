import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Kavenegar from 'kavenegar';
import { Config } from 'src/config';

@Injectable()
export class SmsService {
    constructor(private configService: ConfigService<Config>) {}

    async sendOtp(phone: string, otp: string) {
        const isDevelopment = this.configService.get('env') === 'development';
        if (isDevelopment) {
            console.log(otp);
            return;
        }
        return new Promise((resolve, reject) => {
            const conf: Config['kavenegar'] =
                this.configService.get('kavenegar');

            const api = Kavenegar.KavenegarApi({
                apikey: conf.apiKey,
            });
            api.VerifyLookup(
                {
                    receptor: phone,
                    token: otp,
                    template: conf.template,
                },
                function (response, status) {
                    if (status !== 200) {
                        reject(response);
                    } else {
                        resolve(response);
                    }
                },
            );
        });
    }
}
