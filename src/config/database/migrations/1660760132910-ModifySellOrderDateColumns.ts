import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifySellOrderDateColumns1660760132910 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sell_orders" DROP COLUMN "expireTime"`);
    await queryRunner.query(`ALTER TABLE "sell_orders" DROP COLUMN "startTime"`);

    await queryRunner.query(
      `ALTER TABLE "sell_orders" ADD "expireTime" timestamp NOT NULL default 'now()'`,
    );
    await queryRunner.query(
      `ALTER TABLE "sell_orders" ADD "startTime" timestamp NOT NULL default 'now()'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sell_orders" DROP COLUMN "expireTime"`);
    await queryRunner.query(`ALTER TABLE "sell_orders" DROP COLUMN "startTime"`);

    await queryRunner.query(
      `ALTER TABLE "sell_orders" ADD "startTime" bigint NOT NULL default '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "sell_orders" ADD "expireTime" bigint NOT NULL default '0'`,
    );
  }
}
