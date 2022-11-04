import { MigrationInterface, QueryRunner } from 'typeorm';

export class createSynapseuserAccount1667580186957 implements MigrationInterface {
  name = 'createSynapseuserAccount1667580186957';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_synapse" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "userId" uuid, "userSynapseId" character varying(50), "depositNodeId" character varying(50), "permission" character varying, "permission_code" character varying, "refreshToken" character varying, CONSTRAINT "USER_ID_UNIQUE" UNIQUE ("userId"), CONSTRAINT "REL_8621b23e9b5d1856a2bd293583" UNIQUE ("userId"), CONSTRAINT "PK_1b1f8e684b20b230ce5e10f1ab5" PRIMARY KEY ("id"))`,
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
