import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PackageService } from './package.service';
import { ApiTags } from '@nestjs/swagger';
import { responseMessage } from 'src/dictionaries/response-message';

@ApiTags('package')
@Controller('package')
export class PackageController {
    constructor(private readonly packageService: PackageService) {}

    @Get(':package_id')
    async getOne(@Param('package_id') packageId: string) {
        const pack = await this.packageService.findOne(packageId);
        if (!pack) {
            throw new NotFoundException();
        }
        return {
            message: responseMessage.package.getOne,
            package: pack,
        };
    }

    @Get()
    async getAll() {
        const packages = await this.packageService.findAll();
        return {
            message: responseMessage.package.getAll,
            packages,
        };
    }
}
