import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSynapseUserAccount1666817124994 implements MigrationInterface {
  name = 'CreateSynapseUserAccount1666817124994';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_synapse" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "userId" uuid, "userSynapseId" character varying(24), "depositNodeId" character varying(25), "refreshToken" character varying(250), CONSTRAINT "REL_8621b23e9b5d1856a2bd293583" UNIQUE ("userId"), CONSTRAINT "PK_1b1f8e684b20b230ce5e10f1ab5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_synapse" ADD CONSTRAINT "FK_8621b23e9b5d1856a2bd2935830" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_synapse" DROP CONSTRAINT "FK_8621b23e9b5d1856a2bd2935830"`,
    );
    await queryRunner.query(`DROP TABLE "user_synapse"`);
  }
}
