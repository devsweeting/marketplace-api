import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUrlToSourceUrl1661270005764 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(`ALTER TABLE "asset_media" ALTER COLUMN "url" RENAME TO "source_url"`);
    const table = await queryRunner.getTable('asset_media');
    await queryRunner.renameColumn(table, 'url', 'source_url');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(`ALTER TABLE "asset_media" ALTER COLUMN "source_url" RENAME TO "url"`);
    const table = await queryRunner.getTable('asset_media');
    await queryRunner.renameColumn(table, 'source_url', 'url');
  }
}
