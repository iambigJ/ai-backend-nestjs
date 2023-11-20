import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { Wallet } from './entity/wallet.entity';
import { Transaction } from './entity/transaction.entity';
import { TransactionType } from './entity/transaction.entity';
import { WalletPackage } from './entity/wallet-package.entity';
import { DeepPartial, Repository } from 'typeorm';
import { PackageService } from 'src/package/package.service';
import { Package } from 'src/package/entity/package.entity';
import { errorMessage } from 'src/dictionaries/error-message';

const wallet: DeepPartial<Wallet> = {
    id: 'walletId',
    credit: 0,
    creditUsed: 0,
    giftCredit: 0,
    packages: [
        {
            data: { id: 'packageId', title: 'package1' },
            expireAt: new Date(),
        },
    ],
    user: { id: 'userId' },
    createdAt: new Date(),
    updatedAt: new Date(),
};

jest.mock('typeorm-transactional', () => ({
    Transactional: () => () => ({}),
}));

describe('WalletService', () => {
    let walletService: WalletService;
    let packageService;
    let walletRepository;
    let transactionRepository: jest.Mocked<Repository<Transaction>>;
    let walletPackageRepository: jest.Mocked<Repository<WalletPackage>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WalletService,
                {
                    provide: getRepositoryToken(Wallet),
                    useValue: {
                        findOne: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        createQueryBuilder: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(Transaction),
                    useValue: {
                        save: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(WalletPackage),
                    useValue: {
                        update: jest.fn(),
                        find: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: PackageService,
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        walletService = module.get<WalletService>(WalletService);
        packageService = module.get<PackageService>(PackageService);
        walletRepository = module.get(getRepositoryToken(Wallet));
        transactionRepository = module.get(getRepositoryToken(Transaction));
        walletPackageRepository = module.get(getRepositoryToken(WalletPackage));
    });

    it('should be defined', () => {
        expect(walletService).toBeDefined();
    });

    describe('findOneByUserId', () => {
        it('should find a wallet by userId', async () => {
            walletRepository.createQueryBuilder.mockReturnValue({
                innerJoin: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(wallet),
            });
            const userId = 'userId';
            const result = await walletService.findOneByUserId(userId);
            expect(result).toEqual(wallet);
        });
    });

    describe('createOne', () => {
        it('should create a wallet for a user', async () => {
            const userId = 'user123';

            walletRepository.save.mockResolvedValue(wallet);

            const result = await walletService.createOne(userId);
            expect(result).toEqual(wallet);
        });
    });

    describe('deposit', () => {
        it('should deposit an amount into a wallet', async () => {
            const userId = 'userId';
            const walletId = 'walletId';
            const amount = 100;
            const orderId = 1;

            const wallet: DeepPartial<Wallet> = {
                id: 'walletId',
                credit: 200,
                creditUsed: 25,
                giftCredit: 0,
                packages: [
                    {
                        data: { id: 'packageId', title: 'package1' },
                        expireAt: new Date(),
                        wallet: { id: walletId },
                        creditLeft: 30,
                    },
                    {
                        data: { id: 'packageId', title: 'package1' },
                        expireAt: new Date(),
                        wallet: { id: walletId },
                        creditLeft: 40,
                    },
                    {
                        data: { id: 'packageId', title: 'package1' },
                        expireAt: new Date(),
                        wallet: { id: walletId },
                        creditLeft: 130,
                    },
                ],
                user: { id: userId },
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            walletRepository.createQueryBuilder.mockReturnValue({
                innerJoin: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(wallet),
            });

            await walletService.deposit(userId, amount, orderId);

            expect(transactionRepository.save).toHaveBeenCalledWith({
                amount,
                wallet: { id: walletId },
                order: { id: orderId },
                type: TransactionType.DEPOSIT,
            });

            expect(walletRepository.update).toHaveBeenCalledWith(walletId, {
                giftCredit: 0,
                credit: 300,
            });
        });
    });

    describe('withdraw', () => {
        it('should withdraw an amount from a wallet and related packages', async () => {
            const userId = 'userId';
            const walletId = 'walletId';
            const amount = 75;

            const wallet: DeepPartial<Wallet> = {
                id: 'walletId',
                credit: 200,
                creditUsed: 25,
                giftCredit: 0,
                packages: [
                    {
                        id: 1,
                        data: { id: 'packageId', title: 'package1' },
                        expireAt: new Date(),
                        wallet: { id: walletId },
                        creditLeft: 30,
                    },
                    {
                        id: 2,
                        data: { id: 'packageId', title: 'package1' },
                        expireAt: new Date(),
                        wallet: { id: walletId },
                        creditLeft: 40,
                    },
                    {
                        id: 3,
                        data: { id: 'packageId', title: 'package1' },
                        expireAt: new Date(),
                        wallet: { id: walletId },
                        creditLeft: 130,
                    },
                ],
                user: { id: userId },
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            walletRepository.createQueryBuilder.mockReturnValue({
                innerJoin: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(wallet),
            });

            await walletService.withdraw(userId, amount);

            expect(transactionRepository.save).toHaveBeenCalledWith({
                amount,
                wallet: { id: walletId },
                type: TransactionType.WITHDRAW,
            });

            expect(walletRepository.update).toHaveBeenCalledWith(walletId, {
                credit: 125,
                giftCredit: 0,
                creditUsed: 100,
            });

            const updatePackage1 = expect(
                walletPackageRepository.update,
            ).toHaveBeenCalledWith(1, { creditLeft: 0 });

            const updatePackage2 = expect(
                walletPackageRepository.update,
            ).toHaveBeenCalledWith(2, { creditLeft: 0 });

            const updatePackage3 = expect(
                walletPackageRepository.update,
            ).toHaveBeenCalledWith(3, { creditLeft: 125 });

            await Promise.all([updatePackage1, updatePackage2, updatePackage3]);
        });

        it('should throw an error if the balance is insufficient', async () => {
            const userId = 'userId';
            const walletId = 'walletId';
            const amount = 300;

            const wallet: DeepPartial<Wallet> = {
                id: 'walletId',
                credit: 200,
                creditUsed: 25,
                giftCredit: 0,
                packages: [
                    {
                        data: { id: 'packageId', title: 'package1' },
                        expireAt: new Date(),
                        wallet: { id: walletId },
                        creditLeft: 30,
                    },
                    {
                        data: { id: 'packageId', title: 'package1' },
                        expireAt: new Date(),
                        wallet: { id: walletId },
                        creditLeft: 40,
                    },
                    {
                        data: { id: 'packageId', title: 'package1' },
                        expireAt: new Date(),
                        wallet: { id: walletId },
                        creditLeft: 130,
                    },
                ],
                user: { id: userId },
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            walletRepository.createQueryBuilder.mockReturnValue({
                innerJoin: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(wallet),
            });

            await expect(
                walletService.withdraw(userId, amount),
            ).rejects.toThrowError(errorMessage.wallet.insufficientBalance);
        });

        it('should throw an error if the wallet has no package', async () => {
            const userId = 'userId';
            const walletId = 'walletId';
            const amount = 100;

            const wallet: DeepPartial<Wallet> = {
                id: 'walletId',
                credit: 200,
                creditUsed: 25,
                giftCredit: 0,
                packages: [],
                user: { id: userId },
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            walletRepository.createQueryBuilder.mockReturnValue({
                innerJoin: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(wallet),
            });

            await expect(
                walletService.withdraw(userId, amount),
            ).rejects.toThrowError(errorMessage.wallet.noPackage);
        });

        it('should work if the wallet has no package but wallet has gift credit', async () => {
            const userId = 'userId';
            const walletId = 'walletId';
            const amount = 10;

            const wallet: DeepPartial<Wallet> = {
                id: 'walletId',
                credit: 0,
                creditUsed: 25,
                giftCredit: 10,
                packages: [],
                user: { id: userId },
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            walletRepository.createQueryBuilder.mockReturnValue({
                innerJoin: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(wallet),
            });
            await walletService.withdraw(userId, amount);
            expect(walletRepository.update).toHaveBeenCalledWith(walletId, {
                credit: 0,
                giftCredit: 0,
                creditUsed: 35,
            });
            expect(walletPackageRepository.update).toBeCalledTimes(0);
        });

        it('should empty wallet if wallet has no package but credit left', async () => {
            const userId = 'userId';
            const walletId = 'walletId';
            const amount = 10;

            const wallet: DeepPartial<Wallet> = {
                id: 'walletId',
                credit: 10,
                creditUsed: 25,
                giftCredit: 10,
                packages: [],
                user: { id: userId },
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            walletRepository.createQueryBuilder.mockReturnValue({
                innerJoin: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(wallet),
            });
            await walletService.withdraw(userId, amount);
            expect(walletRepository.update).toHaveBeenCalledWith(walletId, {
                credit: 0,
            });
            expect(walletPackageRepository.update).toBeCalledTimes(0);
        });

        it('should calculate wallet credit', async () => {
            const userId = 'userId';
            const walletId = 'walletId';
            const amount = 8;

            const wallet: DeepPartial<Wallet> = {
                id: 'walletId',
                credit: 0,
                creditUsed: 8,
                giftCredit: 10,
                packages: [],
                user: { id: userId },
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            walletRepository.createQueryBuilder.mockReturnValue({
                innerJoin: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(wallet),
            });
            await walletService.withdraw(userId, amount);
            expect(walletRepository.update).toHaveBeenCalledWith(walletId, {
                credit: 0,
                giftCredit: 2,
                creditUsed: 16,
            });
            expect(walletPackageRepository.update).toBeCalledTimes(0);
        });
    });

    describe('Wallet Package', () => {
        const userId = 'userId';
        const walletId = 'walletId';
        const packageId = 'packageId';

        const wallet: DeepPartial<Wallet> = {
            id: walletId,
            credit: 0,
            creditUsed: 25,
            giftCredit: 0,
            packages: [],
            user: { id: userId },
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const onePackage1: Package = {
            id: packageId,
            createdAt: new Date(),
            updatedAt: new Date(),
            title: 'package1',
            expirationDuration: 24 * 3600,
            credit: 100,
            maxImageUploadSize: 10,
            maxPdfUploadSize: 10,
            price: 1000,
            orders: [],
            walletPackages: [],
        };

        const onePackage2: Package = {
            id: packageId,
            createdAt: new Date(),
            updatedAt: new Date(),
            title: 'package2',
            expirationDuration: null,
            credit: 100,
            maxImageUploadSize: 10,
            maxPdfUploadSize: 10,
            price: 1000,
            orders: [],
            walletPackages: [],
        };
        beforeEach(() => {
            walletRepository.createQueryBuilder.mockReturnValue({
                innerJoin: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(wallet),
            });
        });

        it('should create a wallet package with expire duration of one day', async () => {
            packageService.findOne.mockResolvedValue(onePackage1);
            jest.useFakeTimers({ now: new Date('2023-04-14T10:20:00Z') });
            const expireTime = new Date();
            expireTime.setSeconds(
                expireTime.getSeconds() + onePackage1.expirationDuration,
            );
            await walletService.createWalletPackage(userId, packageId);
            expect(walletPackageRepository.save).toHaveBeenCalledWith({
                wallet: { id: walletId },
                creditLeft: onePackage1.credit,
                maxImageUploadSize: onePackage1.maxImageUploadSize,
                maxPdfUploadSize: onePackage1.maxPdfUploadSize,
                data: { id: packageId },
                expireAt: expireTime,
            });
        });
        it('should create a wallet package with expire time of null', async () => {
            packageService.findOne.mockResolvedValue(onePackage2);
            await walletService.createWalletPackage(userId, packageId);
            expect(walletPackageRepository.save).toHaveBeenCalledWith({
                wallet: { id: walletId },
                creditLeft: onePackage2.credit,
                maxImageUploadSize: onePackage2.maxImageUploadSize,
                maxPdfUploadSize: onePackage2.maxPdfUploadSize,
                data: { id: packageId },
                expireAt: null,
            });
        });
    });
});
