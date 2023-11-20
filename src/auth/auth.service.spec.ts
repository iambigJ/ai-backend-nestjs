import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { CacheService } from 'src/cache/cache.service';
import { SmsService } from 'src/sms/sms.service';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn(),
                        verifyAsync: jest.fn(),
                    },
                },
                {
                    provide: UserService,
                    useValue: {
                        findOne: jest.fn(),
                        updatePassword: jest.fn(),
                        createOne: jest.fn(),
                    },
                },
                {
                    provide: CacheService,
                    useValue: {
                        getUser: jest.fn(),
                        setUser: jest.fn(),
                    },
                },
                {
                    provide: SmsService,
                    useValue: {
                        sendOtp: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
