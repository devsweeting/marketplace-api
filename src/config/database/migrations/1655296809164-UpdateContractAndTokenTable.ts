import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateContractAndTokenTable1655296809164 implements MigrationInterface {
  name = 'UpdateContractAndTokenTable1655296809164';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "supply"`);
    await queryRunner.query(`ALTER TABLE "asset_contracts" DROP COLUMN "symbol"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "asset_contracts" ADD "symbol" character varying(12) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(`ALTER TABLE "tokens" ADD "supply" numeric NOT NULL DEFAULT 1`);
  }
}
