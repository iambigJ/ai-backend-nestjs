import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactsTable1699339324110 implements MigrationInterface {
    name = 'AddContactsTable1699339324110';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "contacts" ("id" SERIAL NOT NULL, "request_type" text NOT NULL, "extra_data" json, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "contacts" ADD CONSTRAINT "FK_af0a71ac1879b584f255c49c99a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "contacts" DROP CONSTRAINT "FK_af0a71ac1879b584f255c49c99a"`,
        );
        await queryRunner.query(`DROP TABLE "contacts"`);
    }
}
