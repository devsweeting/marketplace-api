import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTypeOrmMetadata1662416585994 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'marketplace',
        'public',
        'partner_assets',
        'GENERATED_COLUMN',
        'ts_name',
        "to_tsvector('english', name)",
      ],
    );
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'marketplace',
        'public',
        'partner_assets',
        'GENERATED_COLUMN',
        'ts_description',
        "to_tsvector('english', description)",
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`,
      ['GENERATED_COLUMN', 'ts_name', 'marketplace', 'public', 'partner_assets'],
    );
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`,
      ['GENERATED_COLUMN', 'ts_description', 'marketplace', 'public', 'partner_assets'],
    );
  }
}
