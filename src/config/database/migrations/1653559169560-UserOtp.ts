import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserOtp1653559169560 implements MigrationInterface {
  name = 'UserOtp1653559169560';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "email" character varying NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "used" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_058cf61bf2024c3a3c3bfc4e1b7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_50de8468f2dcf75cd82f527772" ON "user_otps" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_logins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "metadata" jsonb NOT NULL, "userId" uuid, CONSTRAINT "PK_714c63a882ec975c5517f0f22a7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_logins" ADD CONSTRAINT "FK_2eda07eb63172da220fdc20998e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_logins" DROP CONSTRAINT "FK_2eda07eb63172da220fdc20998e"`,
    );
    await queryRunner.query(`DROP TABLE "user_logins"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_50de8468f2dcf75cd82f527772"`);
    await queryRunner.query(`DROP TABLE "user_otps"`);
  }
}
