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
import { SellOrder, SellOrderPurchase } from 'modules/sell-orders/entities';
import { createSellOrder } from '../utils/sell-order.utils';
import { SellOrderTypeEnum } from 'modules/sell-orders/enums/sell-order-type.enum';
import { generateOtpToken } from '../utils/jwt.utils';
import faker from '@faker-js/faker';

describe('SellOrdersController -> Purchases', () => {
  const initialQty = 10000;
  let app: INestApplication;
  let partner: Partner;
  let partnerUser: User;
  let asset: Asset;
  let sellOrder: SellOrder;
  let header;
  let baseUrl: string;
  let seller: User;
  let buyer: User;

  beforeAll(async () => {
    app = await createApp();
  });

  beforeEach(async () => {
    partnerUser = await createUser({ email: 'partner@test.com', role: RoleEnum.USER });
    seller = await createUser({ email: 'seller@test.com', role: RoleEnum.USER });
    buyer = await createUser({ email: 'buyer@test.com', role: RoleEnum.USER });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: partnerUser,
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
      userId: seller.id,
      type: SellOrderTypeEnum.standard,
      fractionQty: initialQty,
      fractionPriceCents: 100,
    });
    baseUrl = `/v1/sellorders/${sellOrder.id}/purchase`;
    header = { Authorization: `Bearer ${generateOtpToken(buyer)}` };
  });

  async function expect400(payload, err: string, purchaser: User = buyer) {
    const headers = { Authorization: `Bearer ${generateOtpToken(purchaser)}` };
    const expected = {
      error: 'Bad Request',
      message: err,
      statusCode: 400,
    };
    return await testApp.post(app, baseUrl, 400, expected, payload, headers);
  }

  afterEach(async () => {
    jest.clearAllMocks();
    await clearAllData();
  });

  describe(`Sell Order purchases`, () => {
    test('should throw 401 exception if jwt is missing', () => {
      return testApp.post(app, baseUrl, 401, null, {}, {});
    });

    test('Should return 201 and purchase sell order', async () => {
      const fractionsToPurchase = 10;
      const fractionPriceCents = sellOrder.fractionPriceCents;
      const payload = { fractionsToPurchase, fractionPriceCents };
      await testApp.post(app, baseUrl, 201, null, payload, header);
      await sellOrder.reload();
      expect(sellOrder.fractionQtyAvailable).toBe(initialQty - fractionsToPurchase);
      const purchase = await SellOrderPurchase.findOne({ sellOrderId: sellOrder.id });
      expect(purchase).toBeDefined();
      expect(purchase.fractionQty).toBe(fractionsToPurchase);
      expect(purchase.fractionPriceCents).toBe(fractionPriceCents);
    });

    test('Should return 201 when purchasing all available fractions, then return 400 on subsequent purchase request', async () => {
      const fractionsToPurchase = initialQty; // purchase all available
      const fractionPriceCents = sellOrder.fractionPriceCents;
      const payload = { fractionsToPurchase, fractionPriceCents };
      await testApp.post(app, baseUrl, 201, null, payload, header);
      await sellOrder.reload();
      expect(sellOrder.fractionQtyAvailable).toBe(0);
      const purchase = await SellOrderPurchase.findOne({ sellOrderId: sellOrder.id });
      expect(purchase).toBeDefined();
      expect(purchase.fractionQty).toBe(fractionsToPurchase);
      expect(purchase.fractionPriceCents).toBe(fractionPriceCents);

      // Attempt to purchase again
      const payload2 = { fractionsToPurchase: 1, fractionPriceCents };
      await expect400(payload2, 'NOT_ENOUGH_AVAILABLE');
    });

    test('should return 404 if sell order startTime is in the future', async () => {
      sellOrder.startTime = faker.date.future().getTime();
      await sellOrder.save();

      const payload = { fractionsToPurchase: 10, fractionPriceCents: sellOrder.fractionPriceCents };
      await testApp.post(app, baseUrl, 404, null, payload, header);
    });

    test('should return 404 if sell order expireTime is in the past', async () => {
      sellOrder.expireTime = faker.date.past().getTime();
      await sellOrder.save();

      const payload = { fractionsToPurchase: 10, fractionPriceCents: sellOrder.fractionPriceCents };
      await testApp.post(app, baseUrl, 404, null, payload, header);
    });

    test('should return 404 if sell order does not exist', async () => {
      await SellOrder.delete({ id: sellOrder.id });
      const payload = { fractionsToPurchase: 10, fractionPriceCents: sellOrder.fractionPriceCents };
      await testApp.post(app, baseUrl, 404, null, payload, header);
    });

    test('should return 404 if sell order is soft-deleted', async () => {
      sellOrder.isDeleted = true;
      sellOrder.deletedAt = new Date();
      await sellOrder.save();
      const payload = { fractionsToPurchase: 10, fractionPriceCents: sellOrder.fractionPriceCents };
      await testApp.post(app, baseUrl, 404, null, payload, header);
    });

    test('should return 400 if qty requested > qty available', async () => {
      const payload = {
        fractionsToPurchase: sellOrder.fractionQtyAvailable + 1,
        fractionPriceCents: sellOrder.fractionPriceCents,
      };
      await expect400(payload, 'NOT_ENOUGH_AVAILABLE');
    });

    test('should return 400 if price != sell order price', async () => {
      const payload = {
        fractionsToPurchase: 10,
        fractionPriceCents: sellOrder.fractionPriceCents + 1,
      };
      await expect400(payload, 'PRICE_MISMATCH');
    });

    test('should return 400 if user attempts to purchase their own sell order', async () => {
      const payload = {
        fractionsToPurchase: 10,
        fractionPriceCents: sellOrder.fractionPriceCents,
      };
      await expect400(payload, 'USER_CANNOT_PURCHASE_OWN_ORDER', seller);
    });
  });
});
