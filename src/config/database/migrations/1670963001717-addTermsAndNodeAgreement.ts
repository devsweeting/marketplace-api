import { MigrationInterface, QueryRunner } from "typeorm";

export class addTermsAndNodeAgreement1670963001717 implements MigrationInterface {
    name = 'addTermsAndNodeAgreement1670963001717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_payments_account" ADD "termsAcceptedDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user_payments_account" ADD "paymentsNodeAgreedDate" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "paymentsNodeAgreedDate"`);
        await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "termsAcceptedDate"`);
    }

}
