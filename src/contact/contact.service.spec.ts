import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Contact } from './entity/contact.entity';

describe('ContactService', () => {
    let service: ContactService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ContactService,
                {
                    provide: getRepositoryToken(Contact),
                    useValue: {
                        save: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ContactService>(ContactService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
