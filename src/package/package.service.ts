import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Package } from './entity/package.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PackageService {
    constructor(
        @InjectRepository(Package)
        private packageRepository: Repository<Package>,
    ) {}

    async findOne(id: string) {
        return this.packageRepository
            .findOne({ where: { id } })
            .then((res) => res)
            .catch(() => null);
    }

    async findAll() {
        return this.packageRepository.find();
    }
}
