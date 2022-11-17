import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOAuthKeyToPaymentAccount1668722450549 implements MigrationInterface {
  name = 'AddOAuthKeyToPaymentAccount1668722450549';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "permission_code"`);
    await queryRunner.query(
      `ALTER TABLE "user_payments_account" ADD "permissionCode" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "user_payments_account" ADD "oauthKey" character varying`);
    await queryRunner.query(
      `ALTER TABLE "user_payments_account" ADD "oauthKeyExpiresAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "oauthKeyExpiresAt"`);
    await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "oauthKey"`);
    await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "permissionCode"`);
    await queryRunner.query(
      `ALTER TABLE "user_payments_account" ADD "permission_code" character varying`,
    );
  }
}
