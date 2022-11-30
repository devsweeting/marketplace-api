import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdditionalPaymentsAccountInfoFix1669840035959 implements MigrationInterface {
  name = 'AddAdditionalPaymentsAccountInfoFix1669840035959';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "permission_code"`);
    await queryRunner.query(
      `ALTER TABLE "user_payments_account" ADD "baseDocumentId" character varying(64)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_payments_account" ADD "permissionCode" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "user_payments_account" ADD "oauthKey" character varying`);
    await queryRunner.query(
      `ALTER TABLE "user_payments_account" ADD "oauthKeyExpiresAt" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "userAccountId"`);
    await queryRunner.query(
      `ALTER TABLE "user_payments_account" ADD "userAccountId" character varying(24)`,
    );
    await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "depositNodeId"`);
    await queryRunner.query(
      `ALTER TABLE "user_payments_account" ADD "depositNodeId" character varying(64)`,
    );
    await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "refreshToken"`);
    await queryRunner.query(
      `ALTER TABLE "user_payments_account" ADD "refreshToken" character varying(48)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "refreshToken"`);
    await queryRunner.query(
      `ALTER TABLE "user_payments_account" ADD "refreshToken" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "depositNodeId"`);
    await queryRunner.query(
      `ALTER TABLE "user_payments_account" ADD "depositNodeId" character varying(50)`,
    );
    await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "userAccountId"`);
    await queryRunner.query(
      `ALTER TABLE "user_payments_account" ADD "userAccountId" character varying(50)`,
    );
    await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "oauthKeyExpiresAt"`);
    await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "oauthKey"`);
    await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "permissionCode"`);
    await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "baseDocumentId"`);
    await queryRunner.query(
      `ALTER TABLE "user_payments_account" ADD "permission_code" character varying`,
    );
  }
}
