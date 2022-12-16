import { MigrationInterface, QueryRunner } from "typeorm";

export class addTermsAndServicesToPaymentUser1671224234531 implements MigrationInterface {
    name = 'addTermsAndServicesToPaymentUser1671224234531'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "paymentsNodeAgreedDate"`);
        await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "agreementStatus"`);
        await queryRunner.query(`ALTER TABLE "user_payments_account" ADD "nodeAgreedDate" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "nodeAgreedDate"`);
        await queryRunner.query(`ALTER TABLE "user_payments_account" ADD "agreementStatus" character varying`);
        await queryRunner.query(`ALTER TABLE "user_payments_account" ADD "paymentsNodeAgreedDate" TIMESTAMP`);
    }

}
