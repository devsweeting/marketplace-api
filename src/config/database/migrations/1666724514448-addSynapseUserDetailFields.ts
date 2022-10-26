import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSynapseUserDetailFields1666724514448 implements MigrationInterface {
  name = 'addSynapseUserDetailFields1666724514448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "accountUserId" character varying(24)`);
    await queryRunner.query(`ALTER TABLE "users" ADD "depositNodeId" character varying(25)`);
    await queryRunner.query(`ALTER TABLE "users" ADD "accountRefreshToken" character varying(250)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "accountRefreshToken"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "depositNodeId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "accountUserId"`);
  }
}
