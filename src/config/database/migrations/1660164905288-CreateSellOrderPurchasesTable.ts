import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSellOrderPurchasesTable1660164905288 implements MigrationInterface {
  name = 'CreateSellOrderPurchasesTable1660164905288';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sell_order_purchases" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "isDeleted" boolean NOT NULL DEFAULT false,
        "sellOrderId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "fractionQty" integer NOT NULL,
        "fractionPriceCents" integer NOT NULL,
        CONSTRAINT "PK_2884eeb1b8991035024acf7c74d" PRIMARY KEY ("id")
        )`,
    );

    await queryRunner.query(
      `ALTER TABLE "sell_order_purchases" ADD CONSTRAINT "FK_ca9d529b097d5c2d085f88624bd" FOREIGN KEY ("sellOrderId") REFERENCES "sell_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sell_order_purchases" ADD CONSTRAINT "FK_7abfc6e49b2d1e8911d9cd76004" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sell_order_purchases" DROP CONSTRAINT "FK_7abfc6e49b2d1e8911d9cd76004"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sell_order_purchases" DROP CONSTRAINT "FK_ca9d529b097d5c2d085f88624bd"`,
    );
    await queryRunner.query(`DROP TABLE "sell_order_purchases"`);
  }
}
