import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { Asset, Media } from 'modules/assets/entities';
import { createAsset } from '@/test/utils/asset.utils';
import { AssetsTransformer } from 'modules/assets/transformers/assets.transformer';
import { v4 } from 'uuid';
import { Partner } from 'modules/partners/entities';
import { createPartner } from '../utils/partner.utils';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { createImageMedia } from '../utils/media.utils';
import { MediaTransformer } from 'modules/assets/transformers/media.transformer';
import { createFile } from '../utils/file.utils';
import * as testApp from '../utils/app.utils';
import { createSellOrder } from '../utils/sell-order.utils';
import { StatusCodes } from 'http-status-codes';

describe('AssetsController', () => {
  let app: INestApplication;
  let asset: Asset;
  let partner: Partner;
  let user: User;
  let assetsTransformer: AssetsTransformer;
  let mediaTransformer: MediaTransformer;
  let header;

  beforeAll(async () => {
    app = await createApp();
    assetsTransformer = app.get(AssetsTransformer);
    mediaTransformer = app.get(MediaTransformer);
    user = await createUser({ email: 'partner@test.com', role: RoleEnum.USER });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
    asset = await createAsset(
      {
        refId: '1',
        name: 'Egg',
        description: 'test-egg',
        attributes: [
          {
            trait: 'foo',
            value: 'bar',
            display: null,
          },
        ],
      },
      partner,
    );

    asset.sellOrders = [
      await createSellOrder({
        assetId: asset.id,
        partnerId: partner.id,
        userId: user.id,
      }),
    ];

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

  describe(`GET V1 /assets/:id`, () => {
    test('should return asset', async () => {
      const media = await createImageMedia({ assetId: asset.id, file: await createFile({}) });
      const response = {
        ...assetsTransformer.transform(asset),
        media: mediaTransformer.transformAll([media]),
      };
      await testApp.get(app, `/v1/assets/${asset.id}`, StatusCodes.OK, response, {}, header);
    });

    test('should return asset only with active media', async () => {
      await Media.delete({});
      const file = await createFile({});
      const media = await createImageMedia({ assetId: asset.id, file, fileId: file.id });
      await createImageMedia({ assetId: asset.id, isDeleted: true, deletedAt: new Date() });
      const response = {
        ...assetsTransformer.transform(asset),
        media: mediaTransformer.transformAll([media]),
      };

      await testApp.get(app, `/v1/assets/${asset.id}`, StatusCodes.OK, response, {}, header);
    });

    test('should 404 exception id is invalid', async () => {
      const response = {
        error: 'Not Found',
        message: 'ASSET_NOT_FOUND',
        statusCode: StatusCodes.NOT_FOUND,
      };
      await testApp.get(app, `/v1/assets/123`, StatusCodes.NOT_FOUND, response, {}, header);
    });

    test('should 404 exception if file does not exist', async () => {
      const response = {
        error: 'Not Found',
        message: 'ASSET_NOT_FOUND',
        statusCode: StatusCodes.NOT_FOUND,
      };
      return testApp.get(app, `/v1/assets/${v4()}`, StatusCodes.NOT_FOUND, response, {}, header);
    });

    test('should 404 if asset is soft-deleted', async () => {
      const toBeDeleted = await createAsset(
        {
          refId: '9999',
          name: 'To be deleted',
          description: 'to-be-deleted',
        },
        partner,
      );

      toBeDeleted.isDeleted = true;
      toBeDeleted.deletedAt = new Date();
      await toBeDeleted.save();

      const response = {
        error: 'Not Found',
        message: 'ASSET_NOT_FOUND',
        statusCode: StatusCodes.NOT_FOUND,
      };
      await testApp.get(
        app,
        `/v1/assets/${toBeDeleted.id}`,
        StatusCodes.NOT_FOUND,
        response,
        {},
        header,
      );
    });
  });
});
