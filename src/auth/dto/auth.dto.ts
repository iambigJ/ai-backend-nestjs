import {
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsStrongPassword,
} from 'class-validator';
import { errorMessage } from 'src/dictionaries/error-message';

export class SendOtpDto {
    @IsString({ message: errorMessage.auth.validation.phone.required })
    @IsPhoneNumber('IR', {
        message: errorMessage.auth.validation.phone.validate,
    })
    phone: string;

    @IsOptional()
    @IsStrongPassword(
        {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        },
        { message: errorMessage.auth.validation.password.validate },
    )
    password: string;
}

export class SignupDto {
    @IsString({ message: errorMessage.auth.validation.phone.required })
    @IsPhoneNumber('IR', {
        message: errorMessage.auth.validation.phone.validate,
    })
    phone: string;

    @IsString()
    @IsNotEmpty({ message: errorMessage.auth.validation.otp.required })
    otp: string;
}

export class ResetPasswordDto {
    @IsString({ message: errorMessage.auth.validation.phone.required })
    @IsPhoneNumber('IR', {
        message: errorMessage.auth.validation.phone.validate,
    })
    phone: string;

    @IsNotEmpty({ message: errorMessage.auth.validation.password.required })
    @IsStrongPassword(
        {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        },
        { message: errorMessage.auth.validation.password.validate },
    )
    password: string;

    @IsString()
    @IsNotEmpty({ message: errorMessage.auth.validation.otp.required })
    otp: string;
}
