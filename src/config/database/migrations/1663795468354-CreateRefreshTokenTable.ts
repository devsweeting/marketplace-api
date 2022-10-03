import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokenTable1663795468354 implements MigrationInterface {
  name = 'CreateRefreshTokenTable1663795468354';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_refresh" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "refreshToken" character varying NOT NULL, "userId" uuid, "isExpired" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_f7ea660257fbdb170b183ca0108" PRIMARY KEY ("id", "refreshToken"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4a424336f166c69500d13a85d5" ON "user_refresh" ("refreshToken") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_refresh" ADD CONSTRAINT "FK_fbdd8f8723aff9fe7b96730cbce" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_refresh" DROP CONSTRAINT "FK_fbdd8f8723aff9fe7b96730cbce"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_4a424336f166c69500d13a85d5"`);
    await queryRunner.query(`DROP TABLE "user_refresh"`);
  }
}
