import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { Partner } from 'modules/partners/entities';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { Asset } from 'modules/assets/entities';
import { createAsset } from '../utils/asset.utils';
import * as testApp from '../utils/app.utils';
import { SellOrder } from 'modules/sell-orders/entities';
import { v4 } from 'uuid';

describe('SellOrdersController', () => {
  let app: INestApplication;
  let partner: Partner;
  let user: User;
  let asset: Asset;
  let header;
  const BASE_URL = `/v1/sellorders`;

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
        slug: `egg-${Date.now()}`,
        description: 'test-egg',
      },
      partner,
    );
    header = {
      'x-api-key': partner.apiKey,
    };
  });

  afterEach(async () => {
    await SellOrder.delete({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`POST V1 /`, () => {
    test('should throw 401 exception if auth token is missing', () => {
      return testApp.post(app, BASE_URL, 401, null, {}, {});
    });

    test('should throw 401 exception if token is invalid', () => {
      const customHeader = { 'x-api-key': 'invalid key' };
      return testApp.post(app, BASE_URL, 401, null, {}, customHeader);
    });

    test('should create sell order', async () => {
      const payload = {
        assetId: asset.id,
        email: user.email,
        fractionQty: 1,
        fractionPriceCents: 1000,
        expireTime: Date.now(),
      };
      const expectedResponse = {
        status: 201,
        description: 'Sell order created',
      };
      await testApp.post(app, BASE_URL, 201, expectedResponse, payload, header);

      const sellOrder = await SellOrder.findOne({
        where: { partnerId: partner.id, assetId: asset.id },
      });
      expect(sellOrder).toBeDefined();
      expect(sellOrder.fractionPriceCents).toEqual(String(payload.fractionPriceCents));
    });
    test('should create sell order', async () => {
      const payload = {
        assetId: asset.id,
        email: user.email,
        fractionQty: 1,
        fractionPriceCents: 1000,
        expireTime: Date.now(),
      };
      const expectedResponse = {
        status: 201,
        description: 'Sell order created',
      };
      await testApp.post(app, BASE_URL, 201, expectedResponse, payload, header);

      const sellOrder = await SellOrder.findOne({
        where: { partnerId: partner.id, assetId: asset.id },
      });
      expect(sellOrder).toBeDefined();
      expect(sellOrder.fractionPriceCents).toEqual(String(payload.fractionPriceCents));
    });

    test('should throw an error when fractionQty is wrong', async () => {
      const payload = {
        assetId: asset.id,
        email: user.email,
        fractionQty: 'wrong',
        fractionPriceCents: 1000,
        expireTime: Date.now(),
      };
      const response = {
        error: 'Bad Request',
        statusCode: 400,
        message: ['fractionQty must not be less than 0', 'fractionQty must be an integer number'],
      };
      await testApp.post(app, BASE_URL, 400, response, payload, header);

      const sellOrder = await SellOrder.findOne({
        where: { partnerId: partner.id, assetId: asset.id },
      });
      expect(sellOrder).not.toBeDefined();
    });
    test('should throw an error when fractionPriceCents is wrong', async () => {
      const payload = {
        assetId: asset.id,
        email: user.email,
        fractionQty: 1,
        fractionPriceCents: 'wrong',
        expireTime: Date.now(),
      };
      const response = {
        error: 'Bad Request',
        statusCode: 400,
        message: [
          'fractionPriceCents must not be less than 0',
          'fractionPriceCents must be an integer number',
        ],
      };
      await testApp.post(app, BASE_URL, 400, response, payload, header);

      const sellOrder = await SellOrder.findOne({
        where: { partnerId: partner.id, assetId: asset.id },
      });
      expect(sellOrder).not.toBeDefined();
    });
    test('should throw an error 404 when assetId is not found', async () => {
      const payload = {
        assetId: v4(),
        email: user.email,
        fractionQty: 1,
        fractionPriceCents: 1000,
        expireTime: Date.now(),
      };
      const response = {
        error: 'Not Found',
        statusCode: 404,
        message: 'ASSET_NOT_FOUND',
      };
      await testApp.post(app, BASE_URL, 404, response, payload, header);

      const sellOrder = await SellOrder.findOne({
        where: { partnerId: partner.id, assetId: asset.id },
      });
      expect(sellOrder).not.toBeDefined();
    });
    test('should throw an error 404 when email is not found', async () => {
      const payload = {
        assetId: asset.id,
        email: 'doesnotexist@example.com',
        fractionQty: 1,
        fractionPriceCents: 1000,
        expireTime: Date.now(),
      };
      const response = {
        error: 'Not Found',
        statusCode: 404,
        message: 'USER_NOT_FOUND',
      };
      await testApp.post(app, BASE_URL, 404, response, payload, header);

      const sellOrder = await SellOrder.findOne({
        where: { partnerId: partner.id, assetId: asset.id },
      });
      expect(sellOrder).not.toBeDefined();
    });
  });
});
