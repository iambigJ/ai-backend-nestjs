import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './guard/auth-local.guard';
import { Request, Response } from 'express';
import { SendOtpDto, SignupDto, ResetPasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guard/auth-jwt.guard';
import { responseMessage } from 'src/dictionaries/response-message';
import {
    ApiLogin,
    ApiResetpassword,
    ApiSendOtp,
    ApiSignup,
} from './swagger/api-response.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiLogin()
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Req() req: Request, @Res() res: Response) {
        console.log(req.user);
        const accessToken = await this.authService.login(req.user);
        res.cookie('auth-token', `Bearer ${accessToken}`, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 30,
            secure: true,
        });

        return res.json({
            message: responseMessage.auth.login,
            accessToken,
        });
    }

    @ApiSendOtp()
    @HttpCode(HttpStatus.OK)
    @Post('send-otp')
    async sendOtp(@Body() body: SendOtpDto) {
        await this.authService.sendAndStoreOTP(body.phone, body.password);
        return {
            message: responseMessage.auth.sendOtp,
        };
    }

    @ApiSignup()
    @Post('signup')
    async signup(@Body() body: SignupDto, @Res() res: Response) {
        const accessToken = await this.authService.signup(body.phone, body.otp);
        res.cookie('auth-token', `Bearer ${accessToken}`, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 30,
            secure: true,
        });
        return res.json({
            message: responseMessage.auth.signup,
            accessToken,
        });
    }

    @ApiResetpassword()
    @HttpCode(HttpStatus.OK)
    @Post('reset-password')
    async resetPassword(@Body() body: ResetPasswordDto) {
        await this.authService.resetPassword(
            body.phone,
            body.password,
            body.otp,
        );
        return {
            message: responseMessage.auth.resetPassword,
        };
    }

    @ApiSecurity('user-auth')
    @UseGuards(JwtAuthGuard)
    @Get('check')
    async check() {
        return {
            message: 'ok',
        };
    }

    @ApiSecurity('user-auth')
    @UseGuards(JwtAuthGuard)
    @Delete('logout')
    async logout(@Res() res: Response) {
        res.clearCookie('auth-token');
        return res.json({
            message: responseMessage.auth.logout,
        });
    }
}
