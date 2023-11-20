import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrders1699786298881 implements MigrationInterface {
    name = 'UpdateOrders1699786298881';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "orders" ADD "callbackId" uuid NOT NULL DEFAULT uuid_generate_v4()`,
        );
        await queryRunner.query(`ALTER TABLE "orders" ADD "ref_id" text`);
        await queryRunner.query(
            `ALTER TABLE "orders" ADD "gateway_code" integer`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" DROP CONSTRAINT "FK_3cb0558ed36997f1d9ecc1118e7"`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" DROP COLUMN "order_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" ADD "order_id" integer`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" DROP CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f"`,
        );
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "id"`);
        await queryRunner.query(
            `ALTER TABLE "orders" ADD "id" SERIAL NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" ADD CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id")`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" ADD CONSTRAINT "FK_3cb0558ed36997f1d9ecc1118e7" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "transactions" DROP CONSTRAINT "FK_3cb0558ed36997f1d9ecc1118e7"`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" DROP CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f"`,
        );
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "id"`);
        await queryRunner.query(
            `ALTER TABLE "orders" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" ADD CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id")`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" DROP COLUMN "order_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" ADD "order_id" uuid`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" ADD CONSTRAINT "FK_3cb0558ed36997f1d9ecc1118e7" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" DROP COLUMN "gateway_code"`,
        );
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "ref_id"`);
        await queryRunner.query(
            `ALTER TABLE "orders" DROP COLUMN "callbackId"`,
        );
    }
}
