import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDropLimits1660941495793 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sell_orders" ADD "userFractionLimit" integer NULL`);
    await queryRunner.query(
      `ALTER TABLE "sell_orders" ADD "userFractionLimitEndTime" timestamp NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sell_orders" DROP COLUMN "userFractionLimitEndTime"`);
    await queryRunner.query(`ALTER TABLE "sell_orders" DROP COLUMN "userFractionLimit"`);
  }
}
