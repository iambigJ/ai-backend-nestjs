import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guard/auth-jwt.guard';
import { Request } from 'express';
import { UpdateUserDto, UpdateUserPasswordDto } from './dto/update-user.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { responseMessage } from 'src/dictionaries/response-message';

@ApiSecurity('user-auth')
@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getUserInfo(@Req() req: Request) {
        const user = await this.userService.findUserInfo(req.user.id);
        return {
            message: responseMessage.user.getUserInfo,
            user,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Patch('info')
    async updateUserInfo(@Req() req: Request, @Body() data: UpdateUserDto) {
        await this.userService.updateUserInfo(req.user.id, data);
        return {
            message: responseMessage.user.updateUserInfo,
            data,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Patch('password')
    async updateUserPassword(
        @Req() req: Request,
        @Body() data: UpdateUserPasswordDto,
    ) {
        await this.userService.updateUserPassword(req.user.id, data);
        return {
            message: responseMessage.user.updateUserPassword,
        };
    }
}
