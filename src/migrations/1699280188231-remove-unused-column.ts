import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUnusedColumn1699280188231 implements MigrationInterface {
    name = 'RemoveUnusedColumn1699280188231';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "transactions" DROP COLUMN "order"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "order" uuid`);
    }
}
