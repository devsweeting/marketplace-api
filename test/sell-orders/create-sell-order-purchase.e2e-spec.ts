/* eslint-disable no-magic-numbers */
import { HttpStatus, INestApplication } from '@nestjs/common';
import { clearAllData, createApp, SupertestResponse } from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { Partner } from 'modules/partners/entities';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { Asset } from 'modules/assets/entities';
import { createAsset } from '../utils/asset.utils';
import * as testApp from '../utils/app.utils';
import { SellOrder } from 'modules/sell-orders/entities';
import {
  createSellOrder,
  expectPurchaseSuccess,
  headerForUser,
  urlFor,
} from '../utils/sell-order.utils';
import { SellOrderTypeEnum } from 'modules/sell-orders/enums/sell-order-type.enum';
import { generateToken } from '../utils/jwt.utils';
import { faker } from '@faker-js/faker';
import { createUserAsset } from '../utils/create-user-asset';
import { UserAsset } from 'modules/users/entities/user-assets.entity';

async function expectCheck(
  app: INestApplication,
  status: number,
  response: Record<string, unknown>,
  sellOrder: SellOrder,
  purchaser: User,
): Promise<void> {
  const url = `/v1/sellorders/${sellOrder.id}/check`;
  await testApp.get(app, url, status, response, null, headerForUser(purchaser));
}

describe('SellOrdersController -> Purchases', () => {
  const initialQty = 10000;
  let app: INestApplication;
  let partner: Partner;
  let partnerUser: User;
  let asset: Asset;
  let sellOrder: SellOrder;
  let dropAsset: Asset;
  let dropSellOrder: SellOrder;
  let seller: User;
  let buyer: User;
  let userAsset: UserAsset;
  let dropUserAsset: UserAsset;

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

    dropAsset = await createAsset({ refId: '2', name: 'Drop' }, partner);
    dropSellOrder = await createSellOrder({
      assetId: dropAsset.id,
      partnerId: partner.id,
      userId: seller.id,
      type: SellOrderTypeEnum.drop,
      fractionQty: initialQty,
      fractionPriceCents: 100,
      userFractionLimit: 10,
      userFractionLimitEndTime: faker.date.future(),
    });

    userAsset = await createUserAsset({
      assetId: sellOrder.assetId,
      userId: sellOrder.userId,
      quantityOwned: sellOrder.fractionQty,
    });

    dropUserAsset = await createUserAsset({
      assetId: dropSellOrder.assetId,
      userId: dropSellOrder.userId,
      quantityOwned: dropSellOrder.fractionQty,
    });
  });

  async function expect4xx(
    status: number,
    payload: Record<string, unknown>,
    err: string,
    msg: string,
    order: SellOrder,
    purchaser: User,
  ): Promise<SupertestResponse> {
    const headers = { Authorization: `Bearer ${generateToken(purchaser)}` };
    const expected = {
      error: err,
      message: msg,
      statusCode: status,
    };
    return await testApp.post(app, urlFor(order), status, expected, payload, headers);
  }

  async function expect400(
    payload,
    msg: string,
    order: SellOrder,
    purchaser: User = buyer,
  ): Promise<void> {
    await expect4xx(HttpStatus.BAD_REQUEST, payload, 'Bad Request', msg, order, purchaser);
  }

  async function expect404(
    payload,
    msg: string,
    order: SellOrder,
    purchaser: User = buyer,
  ): Promise<void> {
    await expect4xx(HttpStatus.NOT_FOUND, payload, 'Not Found', msg, order, purchaser);
  }

  afterEach(async () => {
    jest.clearAllMocks();
    await clearAllData();
  });

  describe(`Sell Order purchases`, () => {
    test('should throw 401 exception if jwt is missing', () => {
      return testApp.post(app, urlFor(sellOrder), HttpStatus.UNAUTHORIZED, null, {}, {});
    });

    test('Should return 201 and purchase sell order', async () => {
      let checkResponse = {
        fractionsAvailableToPurchase: sellOrder.fractionQtyAvailable,
        fractionsPurchased: 0,
      };
      await expectCheck(app, HttpStatus.OK, checkResponse, sellOrder, buyer);
      const fractionsToPurchase = 10;
      const fractionPriceCents = sellOrder.fractionPriceCents;
      await expectPurchaseSuccess(
        app,
        sellOrder,
        fractionsToPurchase,
        fractionPriceCents,
        buyer,
        undefined,
        userAsset,
      );

      await sellOrder.reload();
      checkResponse = {
        fractionsAvailableToPurchase: sellOrder.fractionQtyAvailable,
        fractionsPurchased: fractionsToPurchase,
      };
      await expectCheck(app, HttpStatus.OK, checkResponse, sellOrder, buyer);
    });

    test('Should return 201 when purchasing all available fractions, then return 400 on subsequent purchase request', async () => {
      const fractionsToPurchase = initialQty; // purchase all available
      const fractionPriceCents = sellOrder.fractionPriceCents;
      await expectPurchaseSuccess(
        app,
        sellOrder,
        fractionsToPurchase,
        fractionPriceCents,
        buyer,
        undefined,
        userAsset,
      );

      // Attempt to purchase again
      const payload2 = { fractionsToPurchase: 1, fractionPriceCents };
      await expect400(payload2, 'NOT_ENOUGH_AVAILABLE', sellOrder);
    });

    //DEV - removed since we don't have the concept of a 'Drop' defined anymore
    // test('should return 404 if sell order startTime is in the future', async () => {
    //   sellOrder.startTime = faker.date.future();
    //   await sellOrder.save();

    //   const payload = { fractionsToPurchase: 10, fractionPriceCents: sellOrder.fractionPriceCents };
    //   await expect404(payload, 'SELL_ORDER_NOT_FOUND', sellOrder, buyer);
    // });

    // test('should return 404 if sell order expireTime is in the past', async () => {
    //   sellOrder.expireTime = faker.date.past();
    //   await sellOrder.save();

    //   const payload = { fractionsToPurchase: 10, fractionPriceCents: sellOrder.fractionPriceCents };
    //   await expect404(payload, 'SELL_ORDER_NOT_FOUND', sellOrder, buyer);
    // });

    test('should return 404 if sell order does not exist', async () => {
      await SellOrder.delete({ id: sellOrder.id });
      const payload = { fractionsToPurchase: 10, fractionPriceCents: sellOrder.fractionPriceCents };
      await expect404(payload, 'SELL_ORDER_NOT_FOUND', sellOrder, buyer);
    });

    test('should return 404 if sell order is soft-deleted', async () => {
      sellOrder.isDeleted = true;
      sellOrder.deletedAt = new Date();
      await sellOrder.save();
      const payload = { fractionsToPurchase: 10, fractionPriceCents: sellOrder.fractionPriceCents };
      await expect404(payload, 'SELL_ORDER_NOT_FOUND', sellOrder, buyer);
    });

    test('should return 400 if qty requested > qty available', async () => {
      const payload = {
        fractionsToPurchase: sellOrder.fractionQtyAvailable + 1,
        fractionPriceCents: sellOrder.fractionPriceCents,
      };
      await expect400(payload, 'NOT_ENOUGH_AVAILABLE', sellOrder);
    });

    test('should return 400 if price != sell order price', async () => {
      const payload = {
        fractionsToPurchase: 10,
        fractionPriceCents: sellOrder.fractionPriceCents + 1,
      };
      await expect400(payload, 'PRICE_MISMATCH', sellOrder);
    });

    test('should return 400 if user attempts to purchase their own sell order', async () => {
      const payload = {
        fractionsToPurchase: 10,
        fractionPriceCents: sellOrder.fractionPriceCents,
      };
      await expect400(payload, 'USER_CANNOT_PURCHASE_OWN_ORDER', sellOrder, seller);
    });

    test('should return 400 if user attempts to purchase too many drop shares in the limit window', async () => {
      const payload = {
        fractionsToPurchase: dropSellOrder.userFractionLimit + 1,
        fractionPriceCents: dropSellOrder.fractionPriceCents,
      };
      await expect400(payload, 'PURCHASE_LIMIT_REACHED', dropSellOrder);
    });

    test('should return 400 if user hits limit after successfully purchasing some shares', async () => {
      const checkResponse = {
        fractionsAvailableToPurchase: 10,
        fractionsPurchased: 0,
      };
      await expectCheck(app, HttpStatus.OK, checkResponse, dropSellOrder, buyer);
      const fractionsToPurchase = dropSellOrder.userFractionLimit;
      const fractionPriceCents = dropSellOrder.fractionPriceCents;
      await expectPurchaseSuccess(
        app,
        dropSellOrder,
        fractionsToPurchase,
        fractionPriceCents,
        buyer,
        undefined,
        dropUserAsset,
      );

      await expectCheck(app, HttpStatus.BAD_REQUEST, null, dropSellOrder, buyer);
      const payload = {
        fractionsToPurchase: 1,
        fractionPriceCents: fractionPriceCents,
      };
      await expect400(payload, 'PURCHASE_LIMIT_REACHED', dropSellOrder);
    });

    test('should not hit limit after userFractionLimitEndTime', async () => {
      dropSellOrder.userFractionLimitEndTime = faker.date.recent();
      await dropSellOrder.save();

      const fractionsToPurchase = dropSellOrder.userFractionLimit;
      const fractionPriceCents = dropSellOrder.fractionPriceCents;
      await expectPurchaseSuccess(
        app,
        dropSellOrder,
        fractionsToPurchase,
        fractionPriceCents,
        buyer,
        undefined,
        dropUserAsset,
        fractionsToPurchase,
      );

      await expectPurchaseSuccess(
        app,
        dropSellOrder,
        fractionsToPurchase,
        fractionPriceCents,
        buyer,
        undefined,
        dropUserAsset,
        fractionsToPurchase * 2,
      );
    });
    describe('Sell Order Purchase History', () => {
      test('should return purchase history', async () => {
        const fractionsToPurchase = 10;
        const fractionPriceCents = sellOrder.fractionPriceCents;
        await expectPurchaseSuccess(
          app,
          sellOrder,
          fractionsToPurchase,
          fractionPriceCents,
          buyer,
          undefined,
          userAsset,
        );
        const url = `/v1/sellorders/purchase-history?assetId=${sellOrder.assetId}`;
        // const params = { assetId: sellOrder.assetId };

        const results = await testApp.get(
          app,
          url,
          HttpStatus.OK,
          null,
          null,
          headerForUser(buyer),
        );
        expect(results.body[0].fractionQty).toEqual(fractionsToPurchase);
        expect(results.body[0].fractionPriceCents).toEqual(fractionPriceCents);
        expect(results.body[0].sellOrderId).toEqual(sellOrder.id);
        expect(results.body[0].assetId).toEqual(sellOrder.assetId);
      });

      test('should return empty array if purchase history is emptyy', async () => {
        const url = `/v1/sellorders/purchase-history?assetId=${sellOrder.assetId}`;

        const results = await testApp.get(
          app,
          url,
          HttpStatus.OK,
          null,
          null,
          headerForUser(buyer),
        );
        expect(results.body).toEqual([]);
      });

      test('should return Bad Request if Id is not UUID', async () => {
        const url = `/v1/sellorders/purchase-history?assetId=1`;

        await testApp.get(app, url, HttpStatus.BAD_REQUEST, null, null, headerForUser(buyer));
      });

      test('should return Bad Request if Id is not present', async () => {
        const url = `/v1/sellorders/purchase-history`;

        await testApp.get(app, url, HttpStatus.BAD_REQUEST, null, null, headerForUser(buyer));
      });

      test('should return unauthorized if the user is not in the header', async () => {
        const url = `/v1/sellorders/purchase-history?assetId=${sellOrder.assetId}`;

        await testApp.get(app, url, HttpStatus.UNAUTHORIZED, null, null, {});
      });
    });
  });
});
