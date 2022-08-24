import * as path from 'path';
import { Builder, fixturesIterator, Loader, Parser, Resolver } from 'typeorm-fixtures-cli/dist';
import { createConnection, getRepository } from 'typeorm';
import { NestFactory } from '@nestjs/core';
import faker from '@faker-js/faker';

import { AppModule } from '../../app.module';
import { StorageService } from '../../modules/storage/storage.service';
import { Media } from 'modules/assets/entities';

const baseUrl = 'https://s3.us-west-2.amazonaws.com/fractionalist-nfts';
const urls = [
  `${baseUrl}/assets/media/b2e7087f-7198-4225-ab1f-202db703fa46/d4b064af-59b4-459c-8275-05eefd5607fc`,
  `${baseUrl}/assets/media/e91b100c-3e3e-4db1-8961-136c7a7d4493/e8e4c395-3a17-4dfc-bad6-5ed4437de36a`,
  `${baseUrl}/assets/media/b82c2c8e-47fd-49f7-964b-e54cb1d8bf51/f4643338-f628-4ac6-9d52-73850ee03768`,
  `${baseUrl}/assets/media/a49b2df6-7e7f-430b-8aa3-41ff431fca78/4646b2a5-469b-4277-b50e-ac7bc273a58a`,
  `${baseUrl}/assets/media/cf21c917-3c74-4d2e-abfe-5127dcdae629/75042065-1ceb-495b-85d9-5a18242bf0a1`,
  `${baseUrl}/assets/media/2342ccf8-2ec2-4994-90d2-cc219eeb0e12/26dc2e53-efa1-478f-95f7-1ec583368be8`,
  `${baseUrl}/assets/media/67669b27-a83a-4161-b8bc-8624adfe7162/9624c57a-04d8-433b-9bf5-e3f10ab2ebea`,
  `${baseUrl}/assets/media/6edb2444-d39b-40af-96d5-5e4e60571a3e/7b5d609d-8252-4a46-9db0-80c0ca018c5a`,
  `${baseUrl}/assets/media/67669b27-a83a-4161-b8bc-8624adfe7162/9624c57a-04d8-433b-9bf5-e3f10ab2ebea`,
  `${baseUrl}/assets/media/fba13f84-21f5-48ca-a2dc-9147d2c1ef4c/61084287-d5c1-4060-acae-8b6073815e75`,
];

const mediaToUpdate = [];

const loadFixtures = async (fixturesPath: string) => {
  let connection;
  let app;

  try {
    connection = await createConnection();

    const loader = new Loader();
    loader.load(path.resolve(fixturesPath));

    const resolver = new Resolver();
    const fixtures = resolver.resolve(loader.fixtureConfigs);
    const builder = new Builder(connection, new Parser());

    for (const fixture of fixturesIterator(fixtures)) {
      const entity = await builder.build(fixture);
      if (entity.constructor.name === 'Media') {
        mediaToUpdate.push(entity.asset.id);
      }

      await getRepository(entity.constructor.name).save(entity);
    }
  } catch (err) {
    throw err;
  } finally {
    if (app) {
      if (connection) {
        await connection.close();
      }
      await app.close();
    }
  }
};

const uploadMediaFile = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get<StorageService>(StorageService);
  await Promise.all(
    mediaToUpdate.map(async (el) => {
      const [file] = await service.uploadFromUrls(
        [{ source_url: faker.random.arrayElement(urls) }],
        `assets/${el}`,
      );
      await Media.update(
        { assetId: el },
        {
          file,
        },
      );
    }),
  );
};

loadFixtures('./db/fixtures')
  .then(uploadMediaFile)
  .then(() => console.log('Fixtures are successfully loaded.'))
  .catch((err) => console.log(err));
