import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRefreshTokenColumnOnUser1661837188323 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "refreshToken" VARCHAR(512) DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshToken"`);
  }
}
