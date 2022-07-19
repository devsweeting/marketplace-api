import { MigrationInterface, QueryRunner } from 'typeorm';

export class FileAbsoluteUrl1658255319302 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "files" ADD "absoluteUrl" character varying NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "absoluteUrl"`);
  }
}
