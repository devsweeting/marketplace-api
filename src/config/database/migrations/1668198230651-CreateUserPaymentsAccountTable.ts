import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserPaymentsAccountTable1668198230651 implements MigrationInterface {
  name = 'CreateUserPaymentsAccountTable1668198230651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_payments_account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "userId" uuid, "userAccountId" character varying(50), "depositNodeId" character varying(50), "permission" character varying, "permission_code" character varying, "refreshToken" character varying, CONSTRAINT "USER_ID_UNIQUE" UNIQUE ("userId"), CONSTRAINT "REL_282a4a6ff287de7d51bc3464ca" UNIQUE ("userId"), CONSTRAINT "PK_f120b12ca8ea93591689b9afb90" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_payments_account" ADD CONSTRAINT "FK_282a4a6ff287de7d51bc3464ca4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_payments_account" DROP CONSTRAINT "FK_282a4a6ff287de7d51bc3464ca4"`,
    );
    await queryRunner.query(`DROP TABLE "user_payments_account"`);
  }
}
