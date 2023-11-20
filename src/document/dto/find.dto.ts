import { IsEnum, IsNumberString } from 'class-validator';
import { DocumentStatus } from '../entity/document.entity';
import { PageOptionsDto } from 'src/pagination/dto/page-options.dto';

export class FindDocumentQuery extends PageOptionsDto {
    @IsEnum(DocumentStatus)
    status: DocumentStatus;
}
