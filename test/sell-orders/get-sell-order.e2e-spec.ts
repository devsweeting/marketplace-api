import { HttpStatus, INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { Partner } from 'modules/partners/entities';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { Asset } from 'modules/assets/entities';
import { Event } from 'modules/events/entities';
import { createAsset } from '../utils/asset.utils';
import * as testApp from '../utils/app.utils';
import { SellOrder } from 'modules/sell-orders/entities';
import { v4 } from 'uuid';
import { createSellOrder } from '../utils/sell-order.utils';
import { SellOrdersTransformer } from 'modules/sell-orders/transformers/sell-orders.transformer';

describe('SellOrdersController', () => {
  let app: INestApplication;
  let partner: Partner;
  let anotherPartner: Partner;
  let users: User[];
  let asset: Asset;
  let sellOrder: SellOrder;
  let sellOrdersTransformer: SellOrdersTransformer;
  let header;
  const BASE_URL = `/v1/sellorders/`;

  beforeAll(async () => {
    app = await createApp();
    sellOrdersTransformer = app.get(SellOrdersTransformer);
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
    await Event.delete({});
    await SellOrder.delete({});
    await Asset.delete({});
    await Partner.delete({});
    await User.delete({});
    await clearAllData();
  });

  describe(`GET V1 /`, () => {
    test('should throw 401 exception if auth token is missing', () => {
      return testApp.get(app, BASE_URL + sellOrder.id, HttpStatus.UNAUTHORIZED, null, {}, {});
    });
    test('should throw 401 exception if auth token is wrong', () => {
      const customHeader = { 'x-api-key': 'invalid key' };
      return testApp.get(
        app,
        BASE_URL + sellOrder.id,
        HttpStatus.UNAUTHORIZED,
        null,
        {},
        customHeader,
      );
    });
    test('should throw 401 exception if auth token is wrong and sell order id not found', () => {
      const customHeader = { 'x-api-key': 'invalid key' };
      return testApp.get(app, BASE_URL + v4(), HttpStatus.UNAUTHORIZED, null, {}, customHeader);
    });
    test('should throw 404 exception if sell order id not found', () => {
      return testApp.get(app, BASE_URL + v4(), HttpStatus.NOT_FOUND, null, {}, header);
    });
    test('should return sell order for owner', async () => {
      const expectedResponse = {
        ...sellOrdersTransformer.transform(sellOrder),
      };
      await testApp.get(app, BASE_URL + sellOrder.id, HttpStatus.OK, expectedResponse, {}, header);
    });
    test('should throw 404 error for the sell order another owner', async () => {
      const customHeader = { 'x-api-key': anotherPartner.apiKey };
      const expectedResponse = {
        error: 'Not Found',
        message: 'SELL_ORDER_NOT_FOUND',
        statusCode: HttpStatus.NOT_FOUND,
      };
      await testApp.get(
        app,
        BASE_URL + sellOrder.id,
        HttpStatus.NOT_FOUND,
        expectedResponse,
        {},
        customHeader,
      );
    });
  });
});
