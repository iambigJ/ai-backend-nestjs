import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './entity/contact.entity';
import { Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private contactRepository: Repository<Contact>,
    ) {}

    async create(userId: string, data: CreateContactDto) {
        return this.contactRepository.save({
            user: { id: userId },
            extraData: data.extra,
            requestType: data.type,
        });
    }
}
