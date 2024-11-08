import { HttpStatus, INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { createAsset } from '@/test/utils/asset.utils';
import { Partner } from 'modules/partners/entities';
import { Asset } from 'modules/assets/entities';
import { v4 } from 'uuid';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { createImageMedia } from '../utils/media.utils';
import * as testApp from '../utils/app.utils';
import { AUTH_UNAUTHORIZED } from '../utils/test-helper';

describe('AssetsController', () => {
  let app: INestApplication;
  let partner: Partner;
  let asset: Asset;
  let user: User;
  let header;

  beforeAll(async () => {
    app = await createApp();
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
      },
      partner,
    );
    await createImageMedia({ assetId: asset.id });
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

  describe(`DELETE V1 /assets/:id`, () => {
    test('should throw 401 exception if auth token is missing', () => {
      return testApp.requireAuthorization(
        testApp.del(app, `/v1/assets/${asset.id}`, HttpStatus.UNAUTHORIZED, null, {}, {}),
        AUTH_UNAUTHORIZED,
      );
    });

    test('should throw 401 exception if auth token is invalid', async () => {
      const customHeader = {
        'x-api-key': 'invalid key',
      };
      return testApp.requireAuthorization(
        testApp.del(app, `/v1/assets/${asset.id}`, HttpStatus.UNAUTHORIZED, null, {}, customHeader),
        AUTH_UNAUTHORIZED,
      );
    });

    test('should throw 400 exception if id is not uuid', () => {
      return testApp.del(app, `/v1/assets/123`, HttpStatus.BAD_REQUEST, null, {}, header);
    });

    test('should throw 404 exception if asset does not exist', () => {
      const response = {
        message: 'Not Found',
        statusCode: HttpStatus.NOT_FOUND,
      };
      return testApp.del(app, `/v1/assets/${v4()}`, HttpStatus.NOT_FOUND, null, response, header);
    });

    test('should throw 404 exception if asset does not belong to the partner', async () => {
      const anotherUser = await createUser({});
      const otherPartner = await createPartner({
        apiKey: 'other-test-api-key',
        accountOwner: anotherUser,
      });
      const otherAsset = await createAsset({}, otherPartner);

      return testApp.del(
        app,
        `/v1/assets/${otherAsset.id}`,
        HttpStatus.NOT_FOUND,
        null,
        {},
        header,
      );
    });

    test('should remove asset', async () => {
      await testApp.del(app, `/v1/assets/${asset.id}`, HttpStatus.OK, null, {}, header);

      const persistedAsset = await Asset.findOne({
        where: { id: asset.id, isDeleted: false },
      });

      expect(persistedAsset).toBeNull();
    });
  });
});
