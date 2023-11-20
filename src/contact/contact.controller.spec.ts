import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Contact } from './entity/contact.entity';

describe('ContactController', () => {
    let controller: ContactController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ContactController],
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

        controller = module.get<ContactController>(ContactController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
