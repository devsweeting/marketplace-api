import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { createAsset, softDeleteAsset } from '@/test/utils/asset.utils';
import { Partner } from 'modules/partners/entities';
import { Asset, Attribute, Media } from 'modules/assets/entities';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { Event } from 'modules/events/entities';
import { MediaTypeEnum } from 'modules/assets/enums/media-type.enum';
import * as testApp from '../utils/app.utils';
import { AssetAttributes } from 'modules/assets/entities/asset.entity';
import { AttributeDto } from 'modules/assets/dto';

describe('AssetsController', () => {
  let app: INestApplication;
  let partner: Partner;
  let user: User;
  let header;
  const attrDto: AttributeDto = {
    trait: 'trait name',
    value: 'some value',
    display: 'text',
  };

  beforeAll(async () => {
    app = await createApp();
    user = await createUser({ email: 'partner@test.com', role: RoleEnum.USER });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
    header = {
      'x-api-key': partner.apiKey,
    };
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`POST V1 /assets`, () => {
    test('should throw 401 exception if auth token is missing', () => {
      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1232',
            name: 'Example',
            description: 'test',
            fractionQtyTotal: 1000,
          },
        ],
      };

      return request(app.getHttpServer()).post(`/v1/assets`).send(transferRequest).expect(401);
    });

    test('should throw 401 exception if token is invalid', async () => {
      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1232',
            name: 'Example',
            description: 'test',
            fractionQtyTotal: 1000,
          },
        ],
      };
      const customHeader = { 'x-api-key': 'invalid key' };
      await testApp.post(app, `/v1/assets`, 401, null, transferRequest, customHeader);
    });

    test('should create a new asset transfer object in the db', async () => {
      const media = [
        {
          title: 'test',
          description: 'description',
          sourceUrl:
            'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
          type: MediaTypeEnum.Image,
          sortOrder: 1,
        },
      ];
      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1232',
            media,
            name: 'Example',
            description: 'test',
            attributes: [attrDto],
            fractionQtyTotal: 1000,
          },
        ],
      };
      await testApp.post(app, `/v1/assets`, 201, null, transferRequest, header);

      const asset = await Asset.findOne({
        where: { refId: '1232' },
        relations: ['media', 'media.file'],
      });
      expect(asset).toBeDefined();
      expect(asset.name).toEqual(transferRequest.assets[0].name);
      expect(asset.media).toBeDefined();
      expect(asset.description).toEqual(transferRequest.assets[0].description);
      expect(asset.attributes).toBeDefined();
      expect(asset.attributes).toEqual(new AssetAttributes([attrDto]));
      expect(asset.fractionQtyTotal).toEqual(transferRequest.assets[0].fractionQtyTotal);
    });

    test('should create a new asset transfer object in the db with multiple assets', async () => {
      const media = [
        {
          title: 'test',
          description: 'description',
          sourceUrl:
            'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
          type: MediaTypeEnum.Image,
        },
        {
          title: 'test',
          description: 'description',
          sourceUrl:
            'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
          type: MediaTypeEnum.Image,
        },
      ];
      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '12',
            media,
            name: 'Example',
            description: 'test',
            attributes: [attrDto],
            fractionQtyTotal: 1000,
          },
        ],
      };
      await testApp.post(app, `/v1/assets`, 201, null, transferRequest, header);
      const asset = await Asset.findOne({
        where: { refId: '12' },
        relations: ['media', 'media.file'],
      });
      expect(asset).toBeDefined();
      expect(asset.name).toEqual(transferRequest.assets[0].name);
      expect(asset.media).toBeDefined();
      expect(asset.media.length).toEqual(2);
      expect(asset.media[0].fileId).toBeDefined();
      expect(asset.media[1].fileId).toBeDefined();
      expect(asset.description).toEqual(transferRequest.assets[0].description);
      expect(asset.attributes).toBeDefined();
      expect(asset.attributes).toEqual(new AssetAttributes([attrDto]));
      expect(asset.fractionQtyTotal).toEqual(transferRequest.assets[0].fractionQtyTotal);
    });

    test('should upload only media with type IMAGE', async () => {
      const media = [
        {
          title: 'test',
          description: 'description',
          sourceUrl:
            'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
          type: MediaTypeEnum.Image,
        },
        {
          title: 'test',
          description: 'description',
          sourceUrl: 'https:',
          type: MediaTypeEnum.Youtube,
        },
      ];
      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '13',
            media,
            name: 'Example',
            description: 'test',
            fractionQtyTotal: 1000,
          },
        ],
      };
      await testApp.post(app, `/v1/assets`, 201, null, transferRequest, header);

      const asset = await Asset.findOne({
        where: { refId: '13' },
        relations: ['media', 'media.file'],
      });
      expect(asset).toBeDefined();
      expect(asset.name).toEqual(transferRequest.assets[0].name);
      expect(asset.media).toBeDefined();
      expect(asset.media.length).toEqual(1);
      expect(asset.media[0].fileId).toBeDefined();
      expect(asset.media[1]).toBeUndefined();
      expect(asset.description).toEqual(transferRequest.assets[0].description);
      expect(asset.fractionQtyTotal).toEqual(transferRequest.assets[0].fractionQtyTotal);
    });

    test('should throw error if media is not an acceptable content-type', async () => {
      const media = [
        {
          title: 'test',
          description: 'description',
          sourceUrl: 'https://media.giphy.com/media/l3q2KRkOVYvi8WfU4/giphy.gif',
          type: MediaTypeEnum.Image,
        },
        {
          title: 'test webp',
          description: 'description of a webp image',
          sourceUrl: 'https://www.gstatic.com/webp/gallery/1.webp',
          type: MediaTypeEnum.Image,
        },
      ];
      const transferRequest: any = {
        user: {
          refId: '1235',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '31',
            media,
            name: 'Example',
            description: 'test',
            fractionQtyTotal: 1000,
          },
        ],
      };
      const response = {
        statusCode: 400,
        message: `Error: HttpException: Error: Content-type image/gif for ${media[0].sourceUrl} is not allowed. Use .png, .jpg, or .webp instead`,
      };
      await testApp.post(app, `/v1/assets`, 400, response, transferRequest, header);

      const asset = await Asset.findOne({
        where: { refId: '31' },
        relations: ['media', 'media.file'],
      });

      expect(asset).toBeDefined();
      expect(asset.name).toEqual(transferRequest.assets[0].name);
      expect(asset.media).toBeDefined();
      expect(asset.media.length).toEqual(0);
      expect(asset.description).toEqual(transferRequest.assets[0].description);
      expect(asset.fractionQtyTotal).toEqual(transferRequest.assets[0].fractionQtyTotal);
    });

    test('should throw an error when url is wrong', async () => {
      const media = [
        {
          title: 'test',
          description: 'description',
          sourceUrl: 'https:',
          type: MediaTypeEnum.Image,
        },
      ];
      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '14',
            media,
            name: 'Example',
            description: 'test',
            fractionQtyTotal: 1000,
          },
        ],
      };

      const response = await testApp.post(app, `/v1/assets`, 400, null, transferRequest, header);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain(
        'Error: HttpException: Error: TypeError [ERR_INVALID_URL]: Invalid URL',
      );

      const asset = await Asset.findOne({
        where: { refId: '14' },
        relations: ['media', 'media.file'],
      });
      expect(asset).toBeDefined();
      expect(asset.name).toEqual(transferRequest.assets[0].name);
      expect(asset.media.length).toEqual(0);
      expect(asset.description).toEqual(transferRequest.assets[0].description);
    });

    test('should throw an error when one of the url is fails ', async () => {
      const media = [
        {
          title: 'test',
          description: 'description',
          sourceUrl: 'http://httpstatus:3999/500',
          type: MediaTypeEnum.Image,
        },
        {
          title: 'test',
          description: 'description',
          sourceUrl:
            'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
          type: MediaTypeEnum.Image,
        },
      ];
      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '15',
            media,
            name: 'Example',
            description: 'test',
            fractionQtyTotal: 1000,
          },
        ],
      };
      const response = {
        message: 'Error: HttpException: Error: Error: 500',
        statusCode: 400,
      };
      await testApp.post(app, `/v1/assets`, 400, response, transferRequest, header);

      const asset = await Asset.findOne({
        where: { refId: '15' },
        relations: ['media', 'media.file'],
      });
      expect(asset).toBeDefined();
      expect(asset.name).toEqual(transferRequest.assets[0].name);
      expect(asset.media.length).toEqual(0);
      expect(asset.description).toEqual(transferRequest.assets[0].description);
      expect(asset.fractionQtyTotal).toEqual(transferRequest.assets[0].fractionQtyTotal);
    });

    test('should pass if refId is taken by another partner', async () => {
      const anotherUser = await createUser({});
      const partner2 = await createPartner({
        apiKey: 'another-partner2-api-key',
        accountOwner: anotherUser,
      });
      await Event.delete({});
      await Media.delete({});
      await Attribute.delete({});
      await Asset.delete({});
      await createAsset({ refId: '1232' }, partner2);

      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1232',
            name: 'Example',
            description: 'test',
            fractionQtyTotal: 1000,
          },
        ],
      };
      await testApp.post(app, `/v1/assets`, 201, null, transferRequest, header);
    });

    test('should be able to recreate a deleted asset', async () => {
      await Event.delete({});
      const anotherUser = await createUser({});
      const partner2 = await createPartner({
        apiKey: 'another-partner2-api-key',
        accountOwner: anotherUser,
      });
      const asset = await createAsset({ refId: '1232' }, partner2);
      await softDeleteAsset(asset);
      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1232',
            name: 'Example 1232',
            description: 'test',
          },
        ],
      };
      await testApp.post(app, `/v1/assets`, 400, null, transferRequest, header);
      const getAsset = await Asset.findOne({
        where: { refId: '1232' },
      });
      expect(getAsset).toBeDefined();
    });

    test('should pass if name is used for another asset for the same partner', async () => {
      await createAsset({ refId: '1', name: 'New Asset' }, partner);

      const transferRequest: any = {
        user: {
          refId: '1',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '2',
            name: 'New Asset',
            description: 'test',
            fractionQtyTotal: 1000,
          },
        ],
      };
      return testApp.post(app, `/v1/assets`, 201, null, transferRequest, header);
    });

    test('should pass if name is used for another asset for the different partner', async () => {
      const anotherUser = await createUser({});
      const partner2 = await createPartner({
        apiKey: 'another-partner2-api-key',
        accountOwner: anotherUser,
      });

      await createAsset({ refId: '3', name: 'NewAssetDifferentPartner' }, partner2);

      const transferRequest: any = {
        user: {
          refId: '1233',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '4',
            name: 'NewAssetDifferentPartner',
            description: 'test',
            fractionQtyTotal: 1000,
          },
        ],
      };
      return testApp.post(app, `/v1/assets`, 201, null, transferRequest, header);
    });

    test('should throw 400 exception if asset already exist by refId (same request)', async () => {
      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1232',
            name: 'Example 1',
            description: 'test',
            fractionQtyTotal: 1000,
          },
          {
            refId: '1232',
            name: 'Example 2',
            description: 'test',
            fractionQtyTotal: 1000,
          },
        ],
      };
      const response = {
        statusCode: 400,
        message: 'Duplicated assets',
        refIds: ['1232'],
      };
      return testApp.post(app, `/v1/assets`, 400, response, transferRequest, header);
    });

    test('should throw an exception if assets property is undefined', () => {
      const transferRequest: any = {
        user: {
          refId: 'test',
          email: 'steven@example.com',
        },
      };
      const response = {
        statusCode: 400,
        message: [
          'assets should not be null or undefined',
          'assets must contain at least 1 elements',
        ],
        error: 'Bad Request',
      };
      return testApp.post(app, `/v1/assets`, 400, response, transferRequest, header);
    });

    test('should throw an exception if assets property is empty', () => {
      const transferRequest: any = {
        user: {
          refId: 'test',
          email: 'steven@example.com',
        },
        assets: [],
      };
      const response = {
        statusCode: 400,
        message: ['assets must contain at least 1 elements'],
        error: 'Bad Request',
      };
      return testApp.post(app, `/v1/assets`, 400, response, transferRequest, header);
    });

    test('should throw an exception if asset object is invalid', () => {
      const transferRequest: any = {
        user: {
          refId: 'test',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: 'a'.repeat(105),
          },
        ],
      };
      const response = {
        statusCode: 400,
        message: [
          'assets.0.refId must be shorter than or equal to 100 characters',
          'assets.0.name must be shorter than or equal to 200 characters',
          'assets.0.name should not be empty',
          'assets.0.description should not be empty',
          'assets.0.fractionQtyTotal must not be greater than 1000000000',
          'assets.0.fractionQtyTotal must not be less than 1',
        ],
        error: 'Bad Request',
      };
      return testApp.post(app, `/v1/assets`, 400, response, transferRequest, header);
    });

    test('should throw an exception if partner is deleted', async () => {
      const anotherUser = await createUser({});
      const deletedPartner = await createPartner({
        apiKey: 'deleted-partner-api-key',
        accountOwner: anotherUser,
        deletedAt: new Date(),
        isDeleted: true,
      });

      const transferRequest: any = {
        user: {
          refId: '1236',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1236',
            name: 'Example',
            description: 'test',
            attributes: [
              {
                trait: 'trait name',
                value: 'some value',
                display: 'text',
              },
            ],
          },
        ],
      };
      const customHeader = {
        'x-api-key': deletedPartner.apiKey,
      };
      return testApp.post(app, `/v1/assets`, 401, null, transferRequest, customHeader);
    });
  });
});
