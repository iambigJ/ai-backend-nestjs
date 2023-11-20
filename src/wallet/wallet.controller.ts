import { Body, Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from 'src/auth/guard/auth-jwt.guard';
import { Request } from 'express';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FindTransactionsQuery } from './dto/find-transactions-query.dto';
import { responseMessage } from 'src/dictionaries/response-message';
@ApiSecurity('user-auth')
@ApiTags('user')
@UseGuards(JwtAuthGuard)
@Controller('user/wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @Get()
    async getWallet(@Req() req: Request) {
        const user = req.user;
        const wallet = await this.walletService.findOneByUserId(user.id);
        return {
            message: responseMessage.wallet.getWallet,
            wallet,
        };
    }

    @Get('transaction')
    async getTransactions(
        @Req() req: Request,
        @Query() query: FindTransactionsQuery,
    ) {
        return this.walletService.findTransactions(req.user.id, query);
    }
}
