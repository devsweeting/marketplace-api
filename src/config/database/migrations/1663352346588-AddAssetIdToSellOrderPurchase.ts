import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssetIdToSellOrderPurchase1663352346588 implements MigrationInterface {
  name = 'AddAssetIdToSellOrderPurchase1663352346588';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sell_order_purchases" ADD "assetId" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "sell_order_purchases" ADD CONSTRAINT "FK_6e8ed16faacfd3f2e0cc1c5a1a5" FOREIGN KEY ("assetId") REFERENCES "partner_assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sell_order_purchases" DROP CONSTRAINT "FK_6e8ed16faacfd3f2e0cc1c5a1a5"`,
    );
    await queryRunner.query(`ALTER TABLE "sell_order_purchases" DROP COLUMN "assetId"`);
  }
}
