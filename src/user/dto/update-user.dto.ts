import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsStrongPassword,
} from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    lastName?: string;
}

export class UpdateUserPasswordDto {
    @IsString()
    password: string;

    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    newPassword: string;
}
