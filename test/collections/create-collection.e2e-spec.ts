import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  clearAllData,
  createApp,
  mockFileDownloadService,
  mockS3Provider,
} from '@/test/utils/app.utils';

import { StorageEnum } from 'modules/storage/enums/storage.enum';
import { v4 } from 'uuid';
import { Collection } from 'modules/collections/entities';
import { CollectionDto } from 'modules/collections/dto';

describe('CollectionController', () => {
  let app: INestApplication;
  const mockedUrl = 'https://example.com';
  const mockTmpFilePath = '/tmp/temp-file.jpeg';

  beforeAll(async () => {
    app = await createApp();

    mockS3Provider.getUrl.mockReturnValue(mockedUrl);
    mockS3Provider.upload.mockReturnValue({
      id: v4(),
      name: 'example.jpeg',
      path: 'test/example.jpeg',
      mimeType: 'image/jpeg',
      storage: StorageEnum.S3,
      size: 100,
    });
    mockFileDownloadService.download.mockReturnValue(mockTmpFilePath);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await Collection.delete({});
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`POST /collections`, () => {
    it('should create a new collection object in the db', () => {
      const collectionDto: CollectionDto = {
        name: 'test',
        description: 'description',
        banner: 'https://example.com/image.png',
      };

      return request(app.getHttpServer())
        .post(`/collections`)
        .send(collectionDto)
        .expect(201)
        .then(async () => {
          const collection = await Collection.findOne({
            where: { slug: collectionDto.name },
            relations: ['banner'],
          });
          expect(collection).toBeDefined();
          expect(collection.name).toEqual(collectionDto.name);
          expect(collection.banner).toBeDefined();
          expect(collection.banner.path).toEqual('test/example.jpeg');
          expect(collection.description).toEqual(collectionDto.description);

          expect(mockFileDownloadService.download).toHaveBeenCalledWith(collectionDto.banner);
          expect(mockS3Provider.upload).toHaveBeenCalledWith(
            mockTmpFilePath,
            `collections/${collection.id}`,
          );
        });
    });

    it('should throw an exception if assets property is empty', () => {
      const collectionDto: any = {};

      return request(app.getHttpServer())
        .post(`/collections`)
        .send(collectionDto)
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'name must be shorter than or equal to 200 characters',
            'name should not be empty',
            'description should not be empty',
            'banner must be shorter than or equal to 255 characters',
            'banner should not be empty',
          ],
          error: 'Bad Request',
        });
    });

    it('should throw an exception if asset object is invalid', () => {
      const collectionDto: CollectionDto = {
        name: '',
        description: '',
        banner: '',
      };

      return request(app.getHttpServer())
        .post(`/collections`)
        .send(collectionDto)
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'name should not be empty',
            'description should not be empty',
            'banner should not be empty',
          ],
          error: 'Bad Request',
        });
    });
  });
});
