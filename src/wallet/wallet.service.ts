import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entity/wallet.entity';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from './entity/transaction.entity';
import { WalletPackage } from './entity/wallet-package.entity';
import { PackageService } from 'src/package/package.service';
import { FindTransactionsQuery } from './dto/find-transactions-query.dto';
import { PageMetaDto } from 'src/pagination/dto/page-meta.dto';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';
import { Transactional } from 'typeorm-transactional';
import {
    NoPackageException,
    InsufficientBalanceException,
} from './exception/wallet.exception';

@Injectable()
export class WalletService {
    constructor(
        @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
        @InjectRepository(WalletPackage)
        private walletPackageRepository: Repository<WalletPackage>,
        private packageService: PackageService,
    ) {}

    private getWalletQuery(userId: string) {
        const qb = this.walletRepository.createQueryBuilder('wallet');
        qb.innerJoin('wallet.user', 'user', 'user.id =  :userId', { userId });
        qb.leftJoinAndSelect(
            'wallet.packages',
            'walletPackage',
            'walletPackage.creditLeft > 0 AND (walletPackage.expireAt >= CURRENT_TIMESTAMP OR walletPackage.expireAt IS NULL)',
        );
        qb.leftJoinAndSelect('walletPackage.data', 'data');
        qb.orderBy('walletPackage.creditLeft', 'ASC');
        return qb;
    }

    async findTransactions(userId: string, data: FindTransactionsQuery) {
        const qb = this.transactionRepository.createQueryBuilder('transaction');
        qb.innerJoin('transaction.wallet', 'wallet', 'wallet.user =  :userId', {
            userId,
        });
        qb.leftJoinAndSelect('transaction.order', 'order');

        if (data.type !== 'all') {
            qb.where('transaction.type = :type', { type: data.type });
        }
        qb.orderBy('transaction.createdAt', data.order);
        qb.take(data.take);
        qb.skip(data.skip);

        const [transactions, itemCount] = await qb.getManyAndCount();
        const pageMetaDto = new PageMetaDto({
            itemCount,
            pageOptionsDto: data,
        });
        return new PaginationDto(transactions, pageMetaDto);
    }

    async findMaxUploadSize(userId: string) {
        const qb =
            this.walletPackageRepository.createQueryBuilder('walletPackage');
        qb.innerJoin('walletPackage.wallet', 'wallet');
        qb.innerJoin('wallet.user', 'user', 'user.id =  :userId', { userId });
        qb.where(
            'walletPackage.creditLeft > 0 AND (walletPackage.expireAt >= CURRENT_TIMESTAMP OR walletPackage.expireAt IS NULL)',
        );
        qb.addSelect('MAX(walletPackage.maxImageUploadSize)', 'maxImageSize');
        qb.addSelect('MAX(walletPackage.maxPdfUploadSize)', 'maxPdfSize');
        qb.groupBy('walletPackage.id');
        const result: { maxImageSize: number; maxPdfSize: number } =
            await qb.getRawOne();
        if (!result) {
            return { maxImageSize: 1e7, maxPdfSize: 1e8 };
        }
        return result;
    }

    async findOneByUserId(userId: string) {
        const query = this.getWalletQuery(userId);
        return query.getOne();
    }

    async createOne(userId: string) {
        return this.walletRepository.save({ user: { id: userId } });
    }

    async isWalletPackagesExpired(userId: string) {
        const wallet = await this.findOneByUserId(userId);
        return wallet.packages.length === 0;
    }

    async emptyWallet(walletId: string) {
        return this.walletRepository.update(walletId, {
            credit: 0,
        });
    }

    @Transactional()
    async deposit(
        userId: string,
        amount: number,
        orderId: number | null,
        isGift = false,
    ) {
        const wallet = await this.findOneByUserId(userId);
        await this.transactionRepository.save({
            amount,
            wallet: { id: wallet.id },
            ...(orderId ? { order: { id: orderId } } : {}),
            type: TransactionType.DEPOSIT,
        });
        const newValues: Pick<Wallet, 'credit' | 'giftCredit'> = {
            giftCredit: isGift ? wallet.giftCredit + amount : wallet.giftCredit,
            credit: isGift ? wallet.credit : wallet.credit + amount,
        };
        return this.walletRepository.update(wallet.id, newValues);
    }

    private async withdrawFromPackage(
        packages: WalletPackage[],
        amount: number,
    ) {
        const newPackages: Array<Pick<WalletPackage, 'creditLeft' | 'id'>> = [];

        // withdraw packages
        for (const item of packages) {
            if (amount <= 0) {
                break;
            }
            newPackages.push({
                id: item.id,
                creditLeft: Math.max(0, item.creditLeft - amount),
            });

            amount -= item.creditLeft;
        }

        await Promise.all(
            newPackages.map(({ id, creditLeft }) =>
                this.walletPackageRepository.update(id, {
                    creditLeft: creditLeft,
                }),
            ),
        );
    }

    async canAfford(userId: string, amount: number) {
        const wallet = await this.findOneByUserId(userId);
        const hasAnyPackages = wallet.packages.length > 0;
        const hasAnyGiftCredit = wallet.giftCredit > 0;

        if (wallet.credit > 0 && !hasAnyPackages) {
            await this.emptyWallet(wallet.id);
            wallet.credit = 0;
        }

        if (!hasAnyGiftCredit && !hasAnyPackages) {
            throw new NoPackageException();
        }

        if (wallet.credit + wallet.giftCredit < amount) {
            throw new InsufficientBalanceException();
        }
        return true;
    }

    @Transactional()
    async withdraw(userId: string, amount: number) {
        const wallet = await this.findOneByUserId(userId);
        const hasAnyPackages = wallet.packages.length > 0;
        const hasAnyGiftCredit = wallet.giftCredit > 0;

        if (wallet.credit > 0 && !hasAnyPackages) {
            await this.emptyWallet(wallet.id);
            wallet.credit = 0;
        }

        if (!hasAnyGiftCredit && !hasAnyPackages) {
            throw new NoPackageException();
        }

        if (wallet.credit + wallet.giftCredit < amount) {
            throw new InsufficientBalanceException();
        }

        await this.transactionRepository.save({
            amount,
            wallet: { id: wallet.id },
            type: TransactionType.WITHDRAW,
        });
        const newValues: Pick<Wallet, 'credit' | 'giftCredit' | 'creditUsed'> =
            {
                credit: wallet.credit,
                giftCredit: wallet.giftCredit,
                creditUsed: wallet.creditUsed,
            };
        let amountLeft = amount;
        newValues.creditUsed = wallet.creditUsed + amountLeft;
        if (wallet.giftCredit > 0) {
            newValues.giftCredit = Math.max(0, wallet.giftCredit - amountLeft);
            amountLeft -= wallet.giftCredit;
        }
        if (amountLeft > 0) {
            newValues.credit = wallet.credit - amountLeft;
        }

        return Promise.all([
            this.withdrawFromPackage(wallet.packages, amount),
            this.walletRepository.update(wallet.id, newValues),
        ]);
    }

    async createWalletPackage(userId: string, packageId: string) {
        const [wallet, selectedPackage] = await Promise.all([
            this.findOneByUserId(userId),
            this.packageService.findOne(packageId),
        ]);
        let expireTime = null;
        if (selectedPackage.expirationDuration) {
            expireTime = new Date();
            expireTime.setSeconds(
                expireTime.getSeconds() + selectedPackage.expirationDuration,
            );
        }
        await this.walletPackageRepository.save({
            data: { id: packageId },
            maxImageUploadSize: selectedPackage.maxImageUploadSize,
            maxPdfUploadSize: selectedPackage.maxPdfUploadSize,
            wallet: { id: wallet.id },
            creditLeft: selectedPackage.credit,
            expireAt: expireTime,
        });
    }
}
