import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { RequestType } from '../entity/contact.entity';

export class CreateContactDto {
    @IsEnum(RequestType)
    type: RequestType;

    @IsOptional()
    @IsObject()
    extra: Record<string, any>;
}
