import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrdersDetails1699859186150 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "orders" ALTER COLUMN "extra_details" TYPE jsonb`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "orders" ALTER COLUMN "extra_details" TYPE json`,
        );
    }
}
