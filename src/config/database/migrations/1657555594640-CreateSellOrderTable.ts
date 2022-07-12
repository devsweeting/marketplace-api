import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSellOrderTable1657555594640 implements MigrationInterface {
  name = 'CreateSellOrderTable1657555594640';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sell_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "userId" uuid, "partnerId" uuid NOT NULL, "assetId" uuid NOT NULL, "fractionQty" bigint NOT NULL, "fractionPriceCents" bigint NOT NULL, "expireTime" bigint NOT NULL, "deletedTime" bigint DEFAULT '0', CONSTRAINT "PK_4cd0bf5d8b4fb8ae50efaeddc23" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "sell_orders" ADD CONSTRAINT "FK_9fd56753c0326353b11146c0c94" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sell_orders" ADD CONSTRAINT "FK_bf82fb2990a765d15b07befd746" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sell_orders" ADD CONSTRAINT "FK_c94a65c10e0ffaf3eeb8f3b334a" FOREIGN KEY ("assetId") REFERENCES "partner_assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sell_orders" DROP CONSTRAINT "FK_c94a65c10e0ffaf3eeb8f3b334a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sell_orders" DROP CONSTRAINT "FK_bf82fb2990a765d15b07befd746"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sell_orders" DROP CONSTRAINT "FK_9fd56753c0326353b11146c0c94"`,
    );
    await queryRunner.query(`DROP TABLE "sell_orders"`);
  }
}
