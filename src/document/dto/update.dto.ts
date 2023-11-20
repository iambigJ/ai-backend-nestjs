import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDocumentTextDto {
    @IsString()
    @IsNotEmpty()
    text: string;
}
