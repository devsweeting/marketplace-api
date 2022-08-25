import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUrlToSourceUrl1661270005764 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('asset_media');
    await queryRunner.renameColumn(table, 'url', 'sourceUrl');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('asset_media');
    await queryRunner.renameColumn(table, 'sourceUrl', 'url');
  }
}
