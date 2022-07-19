import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { createAsset } from '@/test/utils/asset.utils';
import { Partner } from 'modules/partners/entities';
import { Asset, Attribute, Media } from 'modules/assets/entities';
import { v4 } from 'uuid';
import { AssetsTransformer } from 'modules/assets/transformers/assets.transformer';
import { generateSlug } from 'modules/common/helpers/slug.helper';
import { createAttribute } from '@/test/utils/attribute.utils';
import { User } from 'modules/users/entities/user.entity';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { createUser } from '../utils/create-user';
import { MediaTypeEnum } from 'modules/assets/enums/media-type.enum';
import * as testApp from '../utils/app.utils';

describe('AssetsController', () => {
  let app: INestApplication;
  let partner: Partner;
  let user: User;
  let asset: Asset;
  let assetTransformer: AssetsTransformer;
  let header;

  beforeAll(async () => {
    app = await createApp();
    user = await createUser({ email: 'partner@test.com', role: RoleEnum.USER });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
    asset = await createAsset({}, partner);
    assetTransformer = app.get(AssetsTransformer);
    header = {
      'x-api-key': partner.apiKey,
    };
  });

  afterEach(async () => {
    await Media.delete({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`PATCH V1 /assets/:id`, () => {
    test('should throw 401 exception if auth token is missing', () => {
      const response = {
        message: 'Unauthorized',
        statusCode: 401,
      };
      return testApp.patch(app, `/v1/assets/${asset.id}`, 401, response, {}, {});
    });

    test('should throw 401 exception if token is invalid', () => {
      const customHeader = {
        'x-api-key': 'invalid key',
      };
      const response = {
        message: 'Unauthorized',
        statusCode: 401,
      };
      return testApp.patch(app, `/v1/assets/${asset.id}`, 401, response, {}, customHeader);
    });

    test('should throw 404 exception if asset does not exist', async () => {
      const response = {
        error: 'Not Found',
        message: 'ASSET_NOT_FOUND',
        statusCode: 404,
      };
      return testApp.patch(app, `/v1/assets/${v4()}`, 404, response, {}, header);
    });

    test('should throw 404 exception if assets belongs to another partner', async () => {
      const anotherUser = await createUser({});
      const anotherPartner = await createPartner({
        apiKey: 'another-api-key',
        accountOwner: anotherUser,
      });
      const anotherAsset = await createAsset({}, anotherPartner);
      const response = {
        error: 'Not Found',
        message: 'ASSET_NOT_FOUND',
        statusCode: 404,
      };
      return testApp.patch(app, `/v1/assets/${anotherAsset.id}`, 404, response, {}, header);
    });

    test('should update refId', async () => {
      const payload = {
        refId: '12345',
      };
      const response = {
        ...assetTransformer.transform(asset),
        refId: payload.refId,
        updatedAt: expect.any(String),
      };
      await testApp.patch(app, `/v1/assets/${asset.id}`, 200, response, payload, header);

      await asset.reload();
      expect(asset.refId).toEqual(payload.refId);
    });

    test('should pass if refId is the same', async () => {
      const payload = {
        refId: asset.refId,
      };
      const response = {
        ...assetTransformer.transform(asset),
        updatedAt: expect.any(String),
      };

      await testApp.patch(app, `/v1/assets/${asset.id}`, 200, response, payload, header);
    });

    test('should throw 409 exception if refId is already taken', async () => {
      await createAsset(
        {
          refId: '123456',
        },
        partner,
      );
      const payload = {
        refId: '123456',
      };
      const response = {
        error: 'Conflict',
        message: 'REF_ALREADY_TAKEN',
        statusCode: 409,
      };
      await testApp.patch(app, `/v1/assets/${asset.id}`, 409, response, payload, header);
    });

    test('should update media', async () => {
      const payload = {
        media: [
          {
            title: 'UPDATED',
            description: 'description',
            url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
            type: MediaTypeEnum.Image,
          },
        ],
      };

      await testApp.patch(app, `/v1/assets/${asset.id}`, 200, null, payload, header);

      const updatedAsset = await Asset.findOne({
        where: { id: asset.id },
        relations: ['media', 'media.file'],
      });

      expect(updatedAsset.media[0]).toBeDefined();
      expect(updatedAsset.media[0].title).toEqual(payload.media[0].title);
      expect(updatedAsset.media[0].file.path).toEqual(
        'assets/' + asset.id + '/' + updatedAsset.media[0].file.name,
      );
    });

    test('should update name', async () => {
      const payload = {
        name: 'Test name 2',
      };

      const response = {
        ...assetTransformer.transform(asset),
        name: payload.name,
        slug: generateSlug(payload.name),
        updatedAt: expect.any(String),
      };

      await testApp.patch(app, `/v1/assets/${asset.id}`, 200, response, payload, header);

      await asset.reload();
      expect(asset.name).toEqual(payload.name);
      expect(asset.slug).toEqual(generateSlug(payload.name));
    });

    test('should throw 409 exception if refID is already exist', async () => {
      await createAsset(
        {
          refId: 'ref-1',
        },
        partner,
      );
      const payload = {
        refId: 'ref-1',
      };
      const response = {
        error: 'Conflict',
        message: 'REF_ALREADY_TAKEN',
        statusCode: 409,
      };

      await testApp.patch(app, `/v1/assets/${asset.id}`, 409, response, payload, header);
    });

    test('should update description', async () => {
      const payload = {
        description: 'some new description',
      };

      const response = {
        ...assetTransformer.transform(asset),
        description: payload.description,
        updatedAt: expect.any(String),
      };

      await testApp.patch(app, `/v1/assets/${asset.id}`, 200, response, payload, header);

      await asset.reload();
      expect(asset.description).toEqual(payload.description);
    });

    test('should not remove attributes', async () => {
      const payload = {};
      const attribute = await createAttribute({ asset });

      const response = {
        ...assetTransformer.transform(asset),
        updatedAt: expect.any(String),
      };

      await testApp.patch(app, `/v1/assets/${asset.id}`, 200, response, payload, header);

      await attribute.reload();
      expect(attribute).toBeDefined();
    });

    test('should remove attributes', async () => {
      const payload = {
        attributes: [],
      };
      const attribute = await createAttribute({ asset });
      const response = {
        ...assetTransformer.transform(asset),
        updatedAt: expect.any(String),
      };

      await testApp.patch(app, `/v1/assets/${asset.id}`, 200, response, payload, header);

      const savedAttribute = await Attribute.findOne(attribute.id);
      expect(savedAttribute).toBeUndefined();
    });

    test('should create new Attribute', async () => {
      const payload = {
        attributes: [
          {
            trait: 'new trait',
            value: 'new value',
            display: 'text',
          },
        ],
      };
      const attribute = await createAttribute({ asset });

      const response = {
        ...assetTransformer.transform(asset),
        updatedAt: expect.any(String),
      };
      await testApp.patch(app, `/v1/assets/${asset.id}`, 200, response, payload, header);

      const savedAttribute = await Attribute.findOne(attribute.id);
      expect(savedAttribute).toBeUndefined();
      const newAttributes = await Attribute.find({ where: { assetId: asset.id } });
      expect(newAttributes).toHaveLength(1);
      expect(newAttributes[0]).toEqual(expect.objectContaining(payload.attributes[0]));
    });
  });
});
