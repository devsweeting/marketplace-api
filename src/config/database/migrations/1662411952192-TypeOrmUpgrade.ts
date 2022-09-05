import { MigrationInterface, QueryRunner } from "typeorm";

export class TypeOrmUpgrade1662411952192 implements MigrationInterface {
    name = 'TypeOrmUpgrade1662411952192'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "collections_assets" DROP CONSTRAINT "FK_f21e2124340c708a5274e4b476e"`);
        await queryRunner.query(`ALTER TABLE "collections_assets" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "collections_assets" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "collections_assets" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "collections_assets" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "collections_assets" DROP COLUMN "isDeleted"`);
        await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "absoluteUrl" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "fractionQtyAvailable" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "startTime" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "expireTime" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "deletedTime" SET NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."sell_order_type_enum" RENAME TO "sell_order_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."sell_orders_type_enum" AS ENUM('standard', 'drop')`);
        await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "type" TYPE "public"."sell_orders_type_enum" USING "type"::"text"::"public"."sell_orders_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sell_order_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "sell_order_purchases" DROP CONSTRAINT "FK_7abfc6e49b2d1e8911d9cd76004"`);
        await queryRunner.query(`ALTER TABLE "sell_order_purchases" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "partner_assets" ALTER COLUMN "attributesJson" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "partner_assets" ALTER COLUMN "fractionQtyTotal" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sell_order_purchases" ADD CONSTRAINT "FK_7abfc6e49b2d1e8911d9cd76004" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "collections_assets" ADD CONSTRAINT "FK_f21e2124340c708a5274e4b476e" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "collections_assets" DROP CONSTRAINT "FK_f21e2124340c708a5274e4b476e"`);
        await queryRunner.query(`ALTER TABLE "sell_order_purchases" DROP CONSTRAINT "FK_7abfc6e49b2d1e8911d9cd76004"`);
        await queryRunner.query(`ALTER TABLE "partner_assets" ALTER COLUMN "fractionQtyTotal" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "partner_assets" ALTER COLUMN "attributesJson" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "sell_order_purchases" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sell_order_purchases" ADD CONSTRAINT "FK_7abfc6e49b2d1e8911d9cd76004" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TYPE "public"."sell_order_type_enum_old" AS ENUM('standard', 'drop')`);
        await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "type" TYPE "public"."sell_order_type_enum_old" USING "type"::"text"::"public"."sell_order_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "type" SET DEFAULT 'standard'`);
        await queryRunner.query(`DROP TYPE "public"."sell_orders_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."sell_order_type_enum_old" RENAME TO "sell_order_type_enum"`);
        await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "deletedTime" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "expireTime" SET DEFAULT '2022-09-05 21:05:32.925569'`);
        await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "startTime" SET DEFAULT '2022-09-05 21:05:32.925569'`);
        await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "fractionQtyAvailable" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "absoluteUrl" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "collections_assets" ADD "isDeleted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "collections_assets" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "collections_assets" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "collections_assets" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "collections_assets" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "collections_assets" ADD CONSTRAINT "FK_f21e2124340c708a5274e4b476e" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
