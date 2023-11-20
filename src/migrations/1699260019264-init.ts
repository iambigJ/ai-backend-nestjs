import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1699260019264 implements MigrationInterface {
    name = 'Init1699260019264';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "discount_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "percent" integer NOT NULL, "max_price" bigint NOT NULL, "max_usage" integer NOT NULL, "expire_at" TIMESTAMP NOT NULL, "deleted_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b967edd0d46547d4a92b4a1c6b3" UNIQUE ("code"), CONSTRAINT "PK_c0170a28d937472e9ce50fdce17" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" text NOT NULL, "amount" bigint NOT NULL, "order" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "wallet_id" uuid, "order_id" uuid, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "wallets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "credit" bigint NOT NULL DEFAULT '0', "gift_credit" bigint NOT NULL DEFAULT '0', "credit_used" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "REL_92558c08091598f7a4439586cd" UNIQUE ("user_id"), CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "wallet_has_packages" ("id" SERIAL NOT NULL, "credit_left" bigint NOT NULL DEFAULT '0', "max_image_upload_size" bigint, "max_pdf_upload_size" bigint, "expire_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "wallet_id" uuid, "package_id" uuid, CONSTRAINT "PK_93a719045de3d758313696af93e" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "packages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "credit" integer NOT NULL, "expiration_duration" integer, "max_image_upload_size" integer, "max_pdf_upload_size" integer, "price" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_020801f620e21f943ead9311c98" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pay_amount" bigint NOT NULL, "status" text NOT NULL DEFAULT 'pending', "package_price" bigint NOT NULL, "discount_amount" bigint NOT NULL DEFAULT '0', "tax" bigint NOT NULL DEFAULT '0', "extra_details" json NOT NULL DEFAULT '{}', "discountCode" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "package_id" uuid, "order_id" uuid, "discount_code_id" uuid, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying, "last_name" character varying, "phone" character varying NOT NULL, "password" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fileType" text NOT NULL, "type" text NOT NULL, "status" text NOT NULL, "page_count" bigint NOT NULL DEFAULT '0', "original_filename" character varying NOT NULL, "original_file_uri" character varying NOT NULL, "ocrOptions" json, "word_uri" character varying, "out_image_uri" character varying, "text_uri" character varying, "json_uri" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "owner_id" uuid, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" ADD CONSTRAINT "FK_0b171330be0cb621f8d73b87a9e" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" ADD CONSTRAINT "FK_3cb0558ed36997f1d9ecc1118e7" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "wallets" ADD CONSTRAINT "FK_92558c08091598f7a4439586cda" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "wallet_has_packages" ADD CONSTRAINT "FK_e97f940cd2638fba498141e84a7" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "wallet_has_packages" ADD CONSTRAINT "FK_b0a0a76447cd7b9c02d8eb2a192" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" ADD CONSTRAINT "FK_26a131e6b65321c990a48beb21a" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" ADD CONSTRAINT "FK_cad55b3cb25b38be94d2ce831db" FOREIGN KEY ("order_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" ADD CONSTRAINT "FK_35ac75839ee034e3f66ceeefdd3" FOREIGN KEY ("discount_code_id") REFERENCES "discount_codes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "documents" ADD CONSTRAINT "FK_888a4852e27627d1ebd8a094e98" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "documents" DROP CONSTRAINT "FK_888a4852e27627d1ebd8a094e98"`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" DROP CONSTRAINT "FK_35ac75839ee034e3f66ceeefdd3"`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" DROP CONSTRAINT "FK_cad55b3cb25b38be94d2ce831db"`,
        );
        await queryRunner.query(
            `ALTER TABLE "orders" DROP CONSTRAINT "FK_26a131e6b65321c990a48beb21a"`,
        );
        await queryRunner.query(
            `ALTER TABLE "wallet_has_packages" DROP CONSTRAINT "FK_b0a0a76447cd7b9c02d8eb2a192"`,
        );
        await queryRunner.query(
            `ALTER TABLE "wallet_has_packages" DROP CONSTRAINT "FK_e97f940cd2638fba498141e84a7"`,
        );
        await queryRunner.query(
            `ALTER TABLE "wallets" DROP CONSTRAINT "FK_92558c08091598f7a4439586cda"`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" DROP CONSTRAINT "FK_3cb0558ed36997f1d9ecc1118e7"`,
        );
        await queryRunner.query(
            `ALTER TABLE "transactions" DROP CONSTRAINT "FK_0b171330be0cb621f8d73b87a9e"`,
        );
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "packages"`);
        await queryRunner.query(`DROP TABLE "wallet_has_packages"`);
        await queryRunner.query(`DROP TABLE "wallets"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TABLE "discount_codes"`);
    }
}
