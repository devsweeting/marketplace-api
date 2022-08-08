import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssetAttributeJSONColumn1659551642976 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "partner_assets" ADD COLUMN "attributesJson" JSONB NOT NULL DEFAULT '[]'::jsonb`,
    );
    await queryRunner.query(`
    UPDATE partner_assets SET "attributesJson" = subquery.attrs FROM
    (
      SELECT
          jsonb_object_agg(aa.trait, json_build_array(aa.value)) AS attrs,
          aa."assetId" AS "assetId"
      FROM asset_attributes aa
      GROUP BY aa."assetId"
    ) AS subquery
    WHERE id = subquery."assetId"
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "partner_assets" DROP COLUMN "attributesJson"`);
  }
}
