import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entity/wallet.entity';
import { Transaction } from './entity/transaction.entity';
import { WalletPackage } from './entity/wallet-package.entity';
import { WalletController } from './wallet.controller';
import { PackageModule } from 'src/package/package.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Wallet, Transaction, WalletPackage]),
        PackageModule,
    ],
    providers: [WalletService],
    controllers: [WalletController],
    exports: [WalletService],
})
export class WalletModule {}
