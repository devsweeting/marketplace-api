import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserAssetsTable1665784042941 implements MigrationInterface {
  name = 'CreateUserAssetsTable1665784042941';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "assetId" uuid NOT NULL, "quantityOwned" integer NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "UQ_be8e5fb4a252d78dc964e7ec56e" UNIQUE ("assetId", "userId"), CONSTRAINT "PK_fd45510df6becbf15bac0ab0e9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_assets" ADD CONSTRAINT "FK_94b20ffef8c0aa2b9ae13eadeda" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_assets" ADD CONSTRAINT "FK_ec28523029f6a000463bd474b47" FOREIGN KEY ("assetId") REFERENCES "partner_assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_assets" DROP CONSTRAINT "FK_ec28523029f6a000463bd474b47"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_assets" DROP CONSTRAINT "FK_94b20ffef8c0aa2b9ae13eadeda"`,
    );
    await queryRunner.query(`DROP TABLE "user_assets"`);
  }
}
