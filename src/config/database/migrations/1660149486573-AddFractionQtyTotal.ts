import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFractionQtyTotal1660149486573 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "partner_assets" ADD "fractionQtyTotal" INT NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "partner_assets" DROP COLUMN "fractionQtyTotal"`);
  }
}
