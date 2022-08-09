import { MigrationInterface, QueryRunner } from 'typeorm';

// The prior migration was identical, except it didn't LOWER() the attribute `trait` column
export class FixAttrsLowerCase1660061994750 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE partner_assets SET "attributesJson" = subquery.attrs FROM
        (
          SELECT
              jsonb_object_agg(LOWER(aa.trait), json_build_array(aa.value)) AS attrs,
              aa."assetId" AS "assetId"
          FROM asset_attributes aa
          GROUP BY aa."assetId"
        ) AS subquery
        WHERE id = subquery."assetId"
    `);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {
    // No-op -- this is irreverisble
  }
}
