import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUserIdColumnInOrders1699279685846
    implements MigrationInterface
{
    name = 'FixUserIdColumnInOrders1699279685846';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "orders" DROP CONSTRAINT "FK_cad55b3cb25b38be94d2ce831db"`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" RENAME COLUMN "order_id" TO "user_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "orders" DROP CONSTRAINT "FK_a922b820eeef29ac1c6800e826a"`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" RENAME COLUMN "user_id" TO "order_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" ADD CONSTRAINT "FK_cad55b3cb25b38be94d2ce831db" FOREIGN KEY ("order_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }
}
