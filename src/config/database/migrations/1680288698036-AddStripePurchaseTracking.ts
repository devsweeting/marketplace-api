import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStripePurchaseTracking1680288698036 implements MigrationInterface {
  name = 'AddStripePurchaseTracking1680288698036';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sell_order_purchases" ADD "stripePurchaseIntentId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "sell_order_purchases" ADD "stripePurchaseStatus" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "sell_order_purchases" ADD "stripeAmountCharged" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sell_order_purchases" DROP COLUMN "stripeAmountCharged"`);
    await queryRunner.query(
      `ALTER TABLE "sell_order_purchases" DROP COLUMN "stripePurchaseStatus"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sell_order_purchases" DROP COLUMN "stripePurchaseIntentId"`,
    );
  }
}
