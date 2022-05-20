import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1652279127303 implements MigrationInterface {
  name = 'Init1652279127303';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "asset_attributes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "trait" character varying(50) NOT NULL, "value" character varying(50) NOT NULL, "maxValue" character varying(50), "display" character varying(50), "assetId" uuid NOT NULL, CONSTRAINT "PK_3fe9b3b51c89c8840763a4dd61a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "asset_labels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "name" character varying(100) NOT NULL, "value" character varying(100) NOT NULL, "assetId" uuid NOT NULL, CONSTRAINT "PK_f56c5347ec446baf22edad8c169" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bcf4d9f0db077207de8bc666fd" ON "asset_labels" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e20aca209c644c46b9a79787c1" ON "asset_labels" ("value") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "tokenId" uuid NOT NULL DEFAULT uuid_generate_v4(), "supply" numeric NOT NULL, "assetId" uuid NOT NULL, "contractId" uuid NOT NULL, CONSTRAINT "REL_cd925ae18813e25c535cb9cc6b" UNIQUE ("assetId"), CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."asset_contracts_chain_enum" AS ENUM('Mainnet', 'Roptsen', 'Rinkeby', 'Polygon Mainnet', 'Polygon Mumbai')`,
    );
    await queryRunner.query(
      `CREATE TABLE "asset_contracts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "address" character varying(42) NOT NULL, "name" character varying(50) NOT NULL, "symbol" character varying(12) NOT NULL, "image" character varying(200), "description" character varying, "externalLink" character varying(1024), "chain" "public"."asset_contracts_chain_enum" NOT NULL DEFAULT 'Mainnet', CONSTRAINT "PK_edbd0dbdaec021631f8107d0243" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_790bc465da0015c055fa90939d" ON "asset_contracts" ("address") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_efb2a1984f8dc39460a105ff11" ON "asset_contracts" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_017825b2dcb45902894d1ef98e" ON "asset_contracts" ("symbol") `,
    );
    await queryRunner.query(`CREATE TYPE "public"."files_storage_enum" AS ENUM('S3')`);
    await queryRunner.query(
      `CREATE TABLE "files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "name" character varying NOT NULL, "path" character varying NOT NULL, "size" bigint NOT NULL DEFAULT '0', "storage" "public"."files_storage_enum" NOT NULL, "mime_type" character varying, CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."asset_media_type_enum" AS ENUM('IMAGE', 'YOUTUBE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "asset_media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "type" "public"."asset_media_type_enum" NOT NULL, "title" character varying NOT NULL, "description" character varying, "url" character varying(1024) NOT NULL DEFAULT '', "sortOrder" integer NOT NULL, "fileId" uuid, "assetId" uuid, CONSTRAINT "PK_ca4ba1fde316ad11efaeacf00af" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "partners_members_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "partnerId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_7a03782f2ed3b04f6d496ca831d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "watchlist_assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "watchlistId" uuid NOT NULL, "assetId" uuid NOT NULL, CONSTRAINT "PK_a6b2c8484091751891b1eb53f4b" PRIMARY KEY ("id", "watchlistId", "assetId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "watchlist" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "userId" uuid NOT NULL, CONSTRAINT "REL_03878f3f177c680cc195900f80" UNIQUE ("userId"), CONSTRAINT "PK_0c8c0dbcc8d379117138e71ad5b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('SUPER_ADMIN', 'ADMIN', 'USER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "email" character varying NOT NULL, "password" character varying, "firstName" character varying(50), "lastName" character varying(50), "address" character varying(150), "nonce" character varying(150), "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "refId" character varying, CONSTRAINT "USER_EMAIL_UNIQUE" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
    await queryRunner.query(
      `CREATE TABLE "partners" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "name" character varying(50) NOT NULL, "apiKey" character varying(32) NOT NULL, "accountOwnerId" uuid NOT NULL, "bannerId" uuid, "logoId" uuid, "avatarId" uuid, CONSTRAINT "REL_563c8061613b862efdf00f5d8a" UNIQUE ("accountOwnerId"), CONSTRAINT "PK_998645b20820e4ab99aeae03b41" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b8d14f1ff3b804b1c020dd99ca" ON "partners" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_325082ad2766d5f1f901091d8a" ON "partners" ("apiKey") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."asset_events_paymenttoken_enum" AS ENUM('ETH', 'WETH', 'DAI')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."asset_events_eventtype_enum" AS ENUM('CREATED', 'MINTED', 'LISTED', 'SOLD', 'REDEEMED', 'BURNED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "asset_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "fromAccount" character varying NOT NULL, "fromAddress" character varying, "toAccount" character varying, "toAddress" character varying, "paymentToken" "public"."asset_events_paymenttoken_enum", "eventType" "public"."asset_events_eventtype_enum" NOT NULL DEFAULT 'CREATED', "isPrivate" boolean NOT NULL DEFAULT false, "quantity" integer DEFAULT '1', "totalPrice" double precision, "assetId" uuid NOT NULL, CONSTRAINT "PK_1a73fcca3bea5c19d1a53d331f5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f691df61106d06891b713243eb" ON "asset_events" ("assetId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "collections_assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "collectionId" uuid NOT NULL, "assetId" uuid NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_b2c4537d7bfe339752a021412a7" PRIMARY KEY ("id", "collectionId", "assetId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "collections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "name" character varying(50) NOT NULL, "slug" character varying NOT NULL, "description" text, "bannerId" uuid, CONSTRAINT "UQ_99d0d14f9f23b45d2c6648c4b57" UNIQUE ("slug"), CONSTRAINT "PK_21c00b1ebbd41ba1354242c5c4e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ed225078e8bf65b448b69105b4" ON "collections" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_99d0d14f9f23b45d2c6648c4b5" ON "collections" ("slug") `,
    );
    await queryRunner.query(
      `CREATE TABLE "partner_assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "refId" character varying(100) NOT NULL, "name" character varying(200) NOT NULL, "slug" character varying NOT NULL, "description" text, "partnerId" uuid, CONSTRAINT "UQ_1cdd68ef6403399fa8cfff0dfd7" UNIQUE ("slug"), CONSTRAINT "PK_c218767437d89da10d9125ec26b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c3aa854d6a5e6b6ac94c68d0bb" ON "partner_assets" ("refId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_efc43b0e4c9a84b8636c7ecae1" ON "partner_assets" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1cdd68ef6403399fa8cfff0dfd" ON "partner_assets" ("slug") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "PARTNER_REF_UNIQUE_DEL" ON "partner_assets" ("refId", "partnerId", "deletedAt") WHERE "deletedAt" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "PARTNER_REF_UNIQUE" ON "partner_assets" ("refId", "partnerId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("id" character varying NOT NULL, "expiresAt" bigint NOT NULL, "data" character varying NOT NULL, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isDeleted" boolean NOT NULL DEFAULT false, "action" character varying(128) NOT NULL, "resource" character varying(128) NOT NULL, "userId" uuid NOT NULL, "recordId" character varying(128) NOT NULL, "recordTitle" character varying(128) NOT NULL, "difference" json, CONSTRAINT "PK_fb1b805f2f7795de79fa69340ba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" DROP CONSTRAINT "PK_b2c4537d7bfe339752a021412a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" ADD CONSTRAINT "PK_cf4cc466f09f5fe62b4453a96ec" PRIMARY KEY ("collectionId", "assetId")`,
    );
    await queryRunner.query(`ALTER TABLE "collections_assets" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "collections_assets" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "collections_assets" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "collections_assets" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "collections_assets" DROP COLUMN "isDeleted"`);
    await queryRunner.query(
      `ALTER TABLE "collections_assets" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" DROP CONSTRAINT "PK_cf4cc466f09f5fe62b4453a96ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" ADD CONSTRAINT "PK_b2c4537d7bfe339752a021412a7" PRIMARY KEY ("collectionId", "assetId", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "collections_assets" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "collections_assets" ADD "isDeleted" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" DROP CONSTRAINT "PK_b2c4537d7bfe339752a021412a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" ADD CONSTRAINT "PK_cf4cc466f09f5fe62b4453a96ec" PRIMARY KEY ("collectionId", "assetId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f21e2124340c708a5274e4b476" ON "collections_assets" ("collectionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9f08fd5618538088650cdcc1bd" ON "collections_assets" ("assetId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_attributes" ADD CONSTRAINT "FK_2ea343736c983ce2fabdc274305" FOREIGN KEY ("assetId") REFERENCES "partner_assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_labels" ADD CONSTRAINT "FK_4fa5004d4dca017b0aa43920104" FOREIGN KEY ("assetId") REFERENCES "partner_assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" ADD CONSTRAINT "FK_cd925ae18813e25c535cb9cc6b6" FOREIGN KEY ("assetId") REFERENCES "partner_assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" ADD CONSTRAINT "FK_135cffa02e73b95721727bd7f61" FOREIGN KEY ("contractId") REFERENCES "asset_contracts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_media" ADD CONSTRAINT "FK_f21551e86d8222ea264554fdfc8" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_media" ADD CONSTRAINT "FK_3825186205acf268343db583707" FOREIGN KEY ("assetId") REFERENCES "partner_assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners_members_users" ADD CONSTRAINT "FK_1188445daeb8156d61a02cba51a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners_members_users" ADD CONSTRAINT "FK_7e55f94e80238acdfc77e87b74f" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "watchlist_assets" ADD CONSTRAINT "FK_81d57b79808274833fb25c61192" FOREIGN KEY ("watchlistId") REFERENCES "watchlist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "watchlist_assets" ADD CONSTRAINT "FK_96dbc7c2a8d169c1e4a14f8d38f" FOREIGN KEY ("assetId") REFERENCES "partner_assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "watchlist" ADD CONSTRAINT "FK_03878f3f177c680cc195900f80a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners" ADD CONSTRAINT "FK_563c8061613b862efdf00f5d8aa" FOREIGN KEY ("accountOwnerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners" ADD CONSTRAINT "FK_42cd0c7f67a392add55a44eb440" FOREIGN KEY ("bannerId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners" ADD CONSTRAINT "FK_d17f99428fde2e5c85a78614ff3" FOREIGN KEY ("logoId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners" ADD CONSTRAINT "FK_986b596be49c38d299c2176e857" FOREIGN KEY ("avatarId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_events" ADD CONSTRAINT "FK_7bd6444014e1bd50fc6f53f36cb" FOREIGN KEY ("assetId") REFERENCES "partner_assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" ADD CONSTRAINT "FK_f21e2124340c708a5274e4b476e" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" ADD CONSTRAINT "FK_9f08fd5618538088650cdcc1bd0" FOREIGN KEY ("assetId") REFERENCES "partner_assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections" ADD CONSTRAINT "FK_a2de733d386e623a4586981ac4d" FOREIGN KEY ("bannerId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partner_assets" ADD CONSTRAINT "FK_806ba36a985772adc035724696e" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "logs" ADD CONSTRAINT "FK_a1196a1956403417fe3a0343390" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "logs" DROP CONSTRAINT "FK_a1196a1956403417fe3a0343390"`);
    await queryRunner.query(
      `ALTER TABLE "partner_assets" DROP CONSTRAINT "FK_806ba36a985772adc035724696e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections" DROP CONSTRAINT "FK_a2de733d386e623a4586981ac4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" DROP CONSTRAINT "FK_9f08fd5618538088650cdcc1bd0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" DROP CONSTRAINT "FK_f21e2124340c708a5274e4b476e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_events" DROP CONSTRAINT "FK_7bd6444014e1bd50fc6f53f36cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners" DROP CONSTRAINT "FK_986b596be49c38d299c2176e857"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners" DROP CONSTRAINT "FK_d17f99428fde2e5c85a78614ff3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners" DROP CONSTRAINT "FK_42cd0c7f67a392add55a44eb440"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners" DROP CONSTRAINT "FK_563c8061613b862efdf00f5d8aa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "watchlist" DROP CONSTRAINT "FK_03878f3f177c680cc195900f80a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "watchlist_assets" DROP CONSTRAINT "FK_96dbc7c2a8d169c1e4a14f8d38f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "watchlist_assets" DROP CONSTRAINT "FK_81d57b79808274833fb25c61192"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners_members_users" DROP CONSTRAINT "FK_7e55f94e80238acdfc77e87b74f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partners_members_users" DROP CONSTRAINT "FK_1188445daeb8156d61a02cba51a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_media" DROP CONSTRAINT "FK_3825186205acf268343db583707"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_media" DROP CONSTRAINT "FK_f21551e86d8222ea264554fdfc8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" DROP CONSTRAINT "FK_135cffa02e73b95721727bd7f61"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" DROP CONSTRAINT "FK_cd925ae18813e25c535cb9cc6b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_labels" DROP CONSTRAINT "FK_4fa5004d4dca017b0aa43920104"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_attributes" DROP CONSTRAINT "FK_2ea343736c983ce2fabdc274305"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_9f08fd5618538088650cdcc1bd"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f21e2124340c708a5274e4b476"`);
    await queryRunner.query(
      `ALTER TABLE "collections_assets" DROP CONSTRAINT "PK_cf4cc466f09f5fe62b4453a96ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" ADD CONSTRAINT "PK_b2c4537d7bfe339752a021412a7" PRIMARY KEY ("collectionId", "assetId", "id")`,
    );
    await queryRunner.query(`ALTER TABLE "collections_assets" DROP COLUMN "isDeleted"`);
    await queryRunner.query(`ALTER TABLE "collections_assets" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "collections_assets" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "collections_assets" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "collections_assets" DROP CONSTRAINT "PK_b2c4537d7bfe339752a021412a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" ADD CONSTRAINT "PK_cf4cc466f09f5fe62b4453a96ec" PRIMARY KEY ("collectionId", "assetId")`,
    );
    await queryRunner.query(`ALTER TABLE "collections_assets" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "collections_assets" ADD "isDeleted" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "collections_assets" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "collections_assets" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" DROP CONSTRAINT "PK_cf4cc466f09f5fe62b4453a96ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections_assets" ADD CONSTRAINT "PK_b2c4537d7bfe339752a021412a7" PRIMARY KEY ("id", "collectionId", "assetId")`,
    );
    await queryRunner.query(`DROP TABLE "logs"`);
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(`DROP INDEX "public"."PARTNER_REF_UNIQUE"`);
    await queryRunner.query(`DROP INDEX "public"."PARTNER_REF_UNIQUE_DEL"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1cdd68ef6403399fa8cfff0dfd"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_efc43b0e4c9a84b8636c7ecae1"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c3aa854d6a5e6b6ac94c68d0bb"`);
    await queryRunner.query(`DROP TABLE "partner_assets"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_99d0d14f9f23b45d2c6648c4b5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ed225078e8bf65b448b69105b4"`);
    await queryRunner.query(`DROP TABLE "collections"`);
    await queryRunner.query(`DROP TABLE "collections_assets"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f691df61106d06891b713243eb"`);
    await queryRunner.query(`DROP TABLE "asset_events"`);
    await queryRunner.query(`DROP TYPE "public"."asset_events_eventtype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."asset_events_paymenttoken_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_325082ad2766d5f1f901091d8a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b8d14f1ff3b804b1c020dd99ca"`);
    await queryRunner.query(`DROP TABLE "partners"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "watchlist"`);
    await queryRunner.query(`DROP TABLE "watchlist_assets"`);
    await queryRunner.query(`DROP TABLE "partners_members_users"`);
    await queryRunner.query(`DROP TABLE "asset_media"`);
    await queryRunner.query(`DROP TYPE "public"."asset_media_type_enum"`);
    await queryRunner.query(`DROP TABLE "files"`);
    await queryRunner.query(`DROP TYPE "public"."files_storage_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_017825b2dcb45902894d1ef98e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_efb2a1984f8dc39460a105ff11"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_790bc465da0015c055fa90939d"`);
    await queryRunner.query(`DROP TABLE "asset_contracts"`);
    await queryRunner.query(`DROP TYPE "public"."asset_contracts_chain_enum"`);
    await queryRunner.query(`DROP TABLE "tokens"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e20aca209c644c46b9a79787c1"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bcf4d9f0db077207de8bc666fd"`);
    await queryRunner.query(`DROP TABLE "asset_labels"`);
    await queryRunner.query(`DROP TABLE "asset_attributes"`);
  }
}
