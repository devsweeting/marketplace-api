import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSellOrder1662423096730 implements MigrationInterface {
  name = 'Fix1662423096730';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "startTime" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "expireTime" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "deletedTime" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TYPE "public"."sell_order_type_enum" RENAME TO "sell_order_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sell_orders_type_enum" AS ENUM('standard', 'drop')`,
    );
    await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "type" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "sell_orders" ALTER COLUMN "type" TYPE "public"."sell_orders_type_enum" USING "type"::"text"::"public"."sell_orders_type_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "type" SET DEFAULT 'standard'`);
    await queryRunner.query(`DROP TYPE "public"."sell_order_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."sell_order_type_enum_old" AS ENUM('standard', 'drop')`,
    );
    await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "type" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "sell_orders" ALTER COLUMN "type" TYPE "public"."sell_order_type_enum_old" USING "type"::"text"::"public"."sell_order_type_enum_old"`,
    );
    await queryRunner.query(`ALTER TABLE "sell_orders" ALTER COLUMN "type" SET DEFAULT 'standard'`);
    await queryRunner.query(`DROP TYPE "public"."sell_orders_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."sell_order_type_enum_old" RENAME TO "sell_order_type_enum"`,
    );
  }
}
