import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { WalletService } from 'src/wallet/wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entity/user.entity';

describe('UserController', () => {
    let controller: UserController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                UserService,
                {
                    provide: WalletService,
                    useValue: {},
                },
                { provide: getRepositoryToken(User), useValue: {} },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
