import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entity/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    DeleteDateColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';

export enum DocumentType {
    General = 'general',
    Identity = 'identity',
    Organization = 'organization',
}

export enum DocumentStatus {
    UPLOADED = 'uploaded',
    PENDING = 'pending',
    FAILED = 'failed',
    CANCELED = 'canceled',
    DONE = 'done',
}

export type OcrOptions = {
    language: 'persian' | 'english';
    extractTables: boolean;
    documentStructure: boolean;
    textWithImage: boolean;
    docType:
        | 'national_card'
        | 'passport'
        | 'bank_card'
        | 'birth_certificate'
        | 'driving_license'
        | 'car_certificate'
        | null;
};

@Entity({ name: 'documents' })
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    fileType: 'image' | 'pdf';

    @Column('text')
    type: DocumentType;

    @Column('text')
    status: DocumentStatus;

    @Column('bigint', {
        default: 0,
        name: 'page_count',
        transformer: {
            to(value) {
                return value;
            },
            from(value) {
                return +value;
            },
        },
    })
    pageCount: number;

    @Column({ name: 'original_filename' })
    originalFilename: string;

    @Column({ name: 'original_file_uri' })
    originalFileUri: string;

    @Column({
        type: 'json',
        default: null,
        nullable: true,
        name: 'ocr_options',
    })
    ocrOptions: OcrOptions | null;

    @Column({ name: 'word_uri', nullable: true, default: null })
    wordUri: string;

    @Column({ name: 'out_image_uri', nullable: true, default: null })
    outImageUri: string;

    @Column({ name: 'text_uri', nullable: true, default: null })
    textUri: string;

    @Column({ name: 'json_uri', nullable: true, default: null })
    jsonUri: string;

    @ApiHideProperty()
    @ManyToOne(() => User, (user) => user.documents)
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @CreateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}
