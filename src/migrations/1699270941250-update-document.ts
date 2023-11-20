import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDocument1699270941250 implements MigrationInterface {
    name = 'UpdateDocument1699270941250';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "documents" RENAME COLUMN "ocrOptions" TO "ocr_options"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "documents" RENAME COLUMN "ocr_options" TO "ocrOptions"`,
        );
    }
}
