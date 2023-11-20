import { Test, TestingModule } from '@nestjs/testing';
import { PackageController } from './package.controller';
import { PackageService } from './package.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Package } from './entity/package.entity';

describe('PackageController', () => {
    let controller: PackageController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PackageController],
            providers: [
                PackageService,
                {
                    provide: getRepositoryToken(Package),
                    useValue: {},
                },
            ],
        }).compile();

        controller = module.get<PackageController>(PackageController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
