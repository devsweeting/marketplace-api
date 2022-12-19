import { MigrationInterface, QueryRunner } from "typeorm";

export class addUserAgreementField1670270624511 implements MigrationInterface {
    name = 'addUserAgreementField1670270624511'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_payments_account" ADD "agreementStatus" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_payments_account" DROP COLUMN "agreementStatus"`);
    }

}
