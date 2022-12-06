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
import * as testApp from '../utils/app.utils';
import { AUTH_UNAUTHORIZED } from '../utils/test-helper';
import { createSellOrder } from '../utils/sell-order.utils';
import { SellOrder } from 'modules/sell-orders/entities';

describe('SellOrdersController', () => {
  let app: INestApplication;
  let partner: Partner;
  let anotherPartner: Partner;
  let users: User[];
  let asset: Asset;
  let sellOrder: SellOrder;
  let header;
  const BASE_URL = `/v1/sellorders/`;

  beforeAll(async () => {
    app = await createApp();
    users = [
      await createUser({ email: 'partner@test.com', role: RoleEnum.USER }),
      await createUser({ email: 'partner1@test.com', role: RoleEnum.USER }),
    ];
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: users[0],
    });
    anotherPartner = await createPartner({
      apiKey: 'test-api-key-another',
      accountOwner: users[1],
    });
    asset = await createAsset(
      {
        refId: '1',
        name: 'Egg',
        description: 'test-egg',
      },
      partner,
    );
    sellOrder = await createSellOrder({
      assetId: asset.id,
      partnerId: partner.id,
      userId: users[0].id,
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

  describe(`DELETE V1 /assets/:id`, () => {
    test('should throw 401 exception if auth token is missing', () => {
      return testApp.requireAuthorization(
        testApp.del(app, BASE_URL + sellOrder.id, HttpStatus.UNAUTHORIZED, null, {}, {}),
        AUTH_UNAUTHORIZED,
      );
    });

    test('should throw 401 exception if auth token is invalid', async () => {
      const customHeader = {
        'x-api-key': 'invalid key',
      };
      return testApp.requireAuthorization(
        testApp.del(app, BASE_URL + sellOrder.id, HttpStatus.UNAUTHORIZED, null, {}, customHeader),
        AUTH_UNAUTHORIZED,
      );
    });

    test('should throw 400 exception if id is not uuid', () => {
      return testApp.del(app, BASE_URL + '123', HttpStatus.BAD_REQUEST, null, {}, header);
    });

    test('should throw 404 exception if sell order does not exist', () => {
      const response = {
        message: 'Not Found',
        statusCode: HttpStatus.NOT_FOUND,
      };
      return testApp.del(app, BASE_URL + v4(), HttpStatus.NOT_FOUND, null, response, header);
    });

    test('should throw 404 exception if sell order does not belong to the partner', async () => {
      const otherAsset = await createAsset({}, anotherPartner);

      return testApp.del(app, BASE_URL + otherAsset.id, HttpStatus.NOT_FOUND, null, {}, header);
    });

    test('should soft remove sell order', async () => {
      await testApp.del(app, BASE_URL + sellOrder.id, HttpStatus.OK, null, {}, header);

      const persistedSellOrder = await SellOrder.findOne({
        where: { id: sellOrder.id, isDeleted: false },
      });
      expect(persistedSellOrder).toBeNull();
    });
  });
});
