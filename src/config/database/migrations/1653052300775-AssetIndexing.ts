import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssetIndexing1653052300775 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE partner_assets ADD COLUMN ts_name tsvector
      GENERATED ALWAYS AS (to_tsvector('english', name)) STORED;`);
    await queryRunner.query(`
      ALTER TABLE partner_assets ADD COLUMN ts_description tsvector
      GENERATED ALWAYS AS (to_tsvector('english', description)) STORED;`);
    await queryRunner.query(`CREATE INDEX ts_name_idx ON partner_assets USING GIN (ts_name);`);
    await queryRunner.query(
      `CREATE INDEX ts_description_idx ON partner_assets USING GIN (ts_description);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX ts_name_idx');
    await queryRunner.query('DROP INDEX ts_description_idx');
    await queryRunner.query(`ALTER TABLE partner_assets DROP COLUMN ts_name`);
    await queryRunner.query(`ALTER TABLE partner_assets DROP COLUMN ts_description`);
  }
}
