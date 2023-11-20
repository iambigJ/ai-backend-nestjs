import { Test, TestingModule } from '@nestjs/testing';
import { SmsService } from './sms.service';
import { ConfigService } from '@nestjs/config';

describe('SmsService', () => {
    let service: SmsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SmsService,
                {
                    provide: ConfigService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<SmsService>(SmsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
