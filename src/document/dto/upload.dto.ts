import { IsBoolean, IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { DocumentType, OcrOptions } from '../entity/document.entity';
import { Transform } from 'class-transformer';

export class UploadDto {
    @IsIn([DocumentType.General, DocumentType.Identity])
    type: DocumentType.General | DocumentType.Identity;
}

export class OcrDto implements OcrOptions {
    @IsIn(['persian', 'english'])
    language: 'persian' | 'english';

    @IsBoolean()
    extractTables: boolean;

    @IsBoolean()
    documentStructure: boolean;

    @IsBoolean()
    textWithImage: boolean;

    @IsIn([
        'national_card',
        'passport',
        'bank_card',
        'birth_certificate',
        'driving_license',
        'car_certificate',
        null,
    ])
    docType:
        | 'national_card'
        | 'passport'
        | 'bank_card'
        | 'birth_certificate'
        | 'driving_license'
        | 'car_certificate'
        | null;
}
