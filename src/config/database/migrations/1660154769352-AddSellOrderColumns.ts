import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSellOrderColumns1660154769352 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add fractionQtyAvailable to sell_orders table
    await queryRunner.query(
      `ALTER TABLE "sell_orders" ADD "fractionQtyAvailable" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(`UPDATE "sell_orders" SET "fractionQtyAvailable" = "fractionQty"`);

    // Add startTime to sell_orders table
    await queryRunner.query(`ALTER TABLE "sell_orders" ADD "startTime" bigint NOT NULL DEFAULT 0`);

    // Create sell_order type enum
    await queryRunner.query(
      `CREATE TYPE "public"."sell_order_type_enum" AS ENUM('standard', 'drop')`,
    );

    // Add type to sell_orders table
    await queryRunner.query(
      `ALTER TABLE "sell_orders" ADD "type" "public"."sell_order_type_enum" NOT NULL DEFAULT 'standard'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop sell_order type column
    await queryRunner.query(`ALTER TABLE "sell_orders" DROP COLUMN "type"`);
    // Drop sell_order type enum
    await queryRunner.query(`DROP TYPE "public"."sell_order_type_enum"`);
    // Drop startTime from sell_orders table
    await queryRunner.query(`ALTER TABLE "sell_orders" DROP COLUMN "startTime"`);
    // Drop fractionQtyAvailable from sell_orders table
    await queryRunner.query(`ALTER TABLE "sell_orders" DROP COLUMN "fractionQtyAvailable"`);
  }
}
