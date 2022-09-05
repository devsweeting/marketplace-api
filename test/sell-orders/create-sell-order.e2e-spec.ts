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
import { faker } from '@faker-js/faker';
import { SellOrderTypeEnum } from 'modules/sell-orders/enums/sell-order-type.enum';

describe('SellOrdersController', () => {
  let app: INestApplication;
  let partner: Partner;
  let user: User;
  let asset: Asset;
  let header;
  let basePayload;
  const BASE_URL = `/v1/sellorders`;

  async function expect400(payload, msg) {
    await expect4xx(400, 'Bad Request', payload, msg);
  }

  async function expect4xx(status: number, err: string, payload, msg) {
    const response = {
      error: err,
      statusCode: status,
      message: msg,
    };
    await testApp.post(app, BASE_URL, status, response, payload, header);
    const sellOrder = await SellOrder.findOne({
      where: { partnerId: partner.id, assetId: asset.id },
    });
    expect(sellOrder).not.toBeDefined();
  }

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
    header = {
      'x-api-key': partner.apiKey,
    };
    basePayload = {
      assetId: asset.id,
      email: user.email,
      fractionQty: 100,
      fractionPriceCents: 250,
      expireTime: new Date(),
      startTime: new Date(),
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
        expireTime: faker.date.future(),
        startTime: new Date(), // Don't mock since it should be now-ish
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
      expect(sellOrder.fractionQtyAvailable).toEqual(payload.fractionQty);
      expect(sellOrder.type).toEqual(SellOrderTypeEnum.standard);
      expect(sellOrder.userFractionLimit).toBeNull();
      expect(sellOrder.userFractionLimitEndTime).toBeNull();
    });
    test('should create sell order', async () => {
      const payload = {
        assetId: asset.id,
        email: user.email,
        fractionQty: 1,
        fractionPriceCents: 1000,
        expireTime: new Date(),
        startTime: new Date(),
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
      expect(sellOrder.fractionQtyAvailable).toEqual(payload.fractionQty);
      expect(sellOrder.type).toEqual(SellOrderTypeEnum.standard);
    });

    test('should throw an error when fractionQty is wrong', async () => {
      const payload = {
        ...basePayload,
        fractionQty: 'wrong',
      };
      await expect400(payload, [
        'fractionQty must not be less than 1',
        'fractionQty must be an integer number',
      ]);
    });
    test('should throw an error when fractionPriceCents is wrong', async () => {
      const payload = {
        ...basePayload,
        fractionPriceCents: 'wrong',
      };
      await expect400(payload, [
        'fractionPriceCents must not be less than 1',
        'fractionPriceCents must be an integer number',
      ]);
    });
    test('should throw an error 404 when assetId is not found', async () => {
      const payload = {
        assetId: v4(),
        email: user.email,
        fractionQty: 1,
        fractionPriceCents: 1000,
        expireTime: new Date(),
        startTime: new Date(),
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
        expireTime: new Date(),
        startTime: new Date(),
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

    test('should return 400 when `drop` type specified without `userFractionLimit`', async () => {
      const payload = {
        ...basePayload,
        type: 'drop',
      };
      await expect400(
        payload,
        'INVALID_USER_FRACTION_LIMIT: userFractionLimit is required for `drop` type sell order',
      );
    });

    test('should return 400 when userFractionLimit > fractionQty', async () => {
      const payload = {
        ...basePayload,
        type: 'drop',
        userFractionLimit: basePayload.fractionQty + 1,
      };
      await expect400(
        payload,
        'INVALID_USER_FRACTION_LIMIT: userFractionLimit must be less than or equal to fractionQty',
      );
    });

    test('should return 400 when `drop` type specified without `userFractionLimitEndTime`', async () => {
      const payload = {
        ...basePayload,
        type: 'drop',
        userFractionLimit: 1,
      };
      await expect400(
        payload,
        'INVALID_USER_FRACTION_LIMIT_END_TIME: userFractionLimitEndTime is required for `drop` type sell order',
      );
    });

    test('should return 400 when `drop` type specified with invalid `userFractionLimitEndTime`', async () => {
      const payload = {
        ...basePayload,
        type: 'drop',
        userFractionLimit: 1,
        userFractionLimitEndTime: faker.date.past(),
      };
      await expect400(
        payload,
        'INVALID_USER_FRACTION_LIMIT_END_TIME: userFractionLimitEndTime must be greater than startTime',
      );
    });

    test('should return 201 when `drop` type specified correctly', async () => {
      const payload = {
        ...basePayload,
        type: 'drop',
        userFractionLimit: 1,
        userFractionLimitEndTime: faker.date.future(),
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
      expect(sellOrder.fractionQtyAvailable).toEqual(payload.fractionQty);
      expect(sellOrder.type).toEqual(SellOrderTypeEnum.drop);
      expect(sellOrder.userFractionLimit).toEqual(payload.userFractionLimit);
      expect(sellOrder.userFractionLimitEndTime).toEqual(payload.userFractionLimitEndTime);
    });

    test('should return 201 when `drop` userFractionLimit == fractionQty', async () => {
      const payload = {
        ...basePayload,
        type: 'drop',
        fractionQty: 1000,
        userFractionLimit: 1000,
        userFractionLimitEndTime: faker.date.future(),
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
      expect(sellOrder.fractionQtyAvailable).toEqual(payload.fractionQty);
      expect(sellOrder.type).toEqual(SellOrderTypeEnum.drop);
      expect(sellOrder.userFractionLimit).toEqual(payload.userFractionLimit);
      expect(sellOrder.userFractionLimitEndTime).toEqual(payload.userFractionLimitEndTime);
    });
  });
});
