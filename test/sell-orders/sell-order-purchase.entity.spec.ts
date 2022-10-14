import { faker } from '@faker-js/faker';
import { INestApplication, InternalServerErrorException } from '@nestjs/common';
import { Asset } from 'modules/assets/entities';
import { Partner } from 'modules/partners/entities';
import { SellOrder, SellOrderPurchase } from 'modules/sell-orders/entities';
import { SellOrderTypeEnum } from 'modules/sell-orders/enums/sell-order-type.enum';
import {
  InvalidSeller,
  NotEnoughAvailableException,
  NotEnoughUnitsFromSeller,
  PriceMismatchException,
  PurchaseLimitReached,
  SellerNotAssetOwnerException,
  SellOrderNotFoundException,
  UserCannotPurchaseOwnOrderException,
} from 'modules/sell-orders/exceptions';
import { User } from 'modules/users/entities';
import { UserAsset } from 'modules/users/entities/user-assets.entity';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { clearAllData, createApp } from '../utils/app.utils';
import { createAsset } from '../utils/asset.utils';
import { createUser } from '../utils/create-user';
import { createPartner } from '../utils/partner.utils';
import { createSellOrder } from '../utils/sell-order.utils';
import { createUserAsset } from '../utils/user';

let app: INestApplication;
const initialQty = 10000;
const fakeUUID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

let partner: Partner;
let partnerUser: User;
let asset: Asset;
let sellOrder: SellOrder;
let assetDrop: Asset;
let sellOrderDrop: SellOrder;
let seller: User;
let buyer: User;
let userAsset: UserAsset;
let userAssetDrop: UserAsset;
beforeAll(async () => {
  app = await createApp();
});
beforeEach(async () => {
  partnerUser = await createUser({ email: 'partner1@test.com', role: RoleEnum.USER });
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
  userAsset = await createUserAsset({
    assetId: sellOrder.assetId,
    userId: sellOrder.userId,
    quantityOwned: sellOrder.fractionQty,
  });

  assetDrop = await createAsset({ refId: '2', name: 'Drop' }, partner);
  sellOrderDrop = await createSellOrder({
    assetId: assetDrop.id,
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

  userAssetDrop = await createUserAsset({
    assetId: sellOrderDrop.assetId,
    userId: sellOrderDrop.userId,
    quantityOwned: sellOrderDrop.fractionQty,
  });
});
afterEach(async () => {
  jest.clearAllMocks();
  await clearAllData();
});
describe('SellOrderPurchase', () => {
  describe('from', () => {
    test('should throw if sellOrder does not exist', async () => {
      const unitsToPurchase = 9;

      try {
        await SellOrderPurchase.from(
          buyer,
          { id: fakeUUID },
          {
            fractionsToPurchase: unitsToPurchase,
            fractionPriceCents: sellOrder.fractionPriceCents,
          },
        );
      } catch (error) {
        expect(error).toBeInstanceOf(SellOrderNotFoundException);
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should throw error if purchase amount is greater than available amount ', async () => {
      const unitsToPurchase = sellOrder.fractionQty + 1;
      try {
        await SellOrderPurchase.from(buyer, sellOrder, {
          fractionsToPurchase: unitsToPurchase,
          fractionPriceCents: sellOrder.fractionPriceCents,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(NotEnoughAvailableException);
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should throw error if fraction price is not equal', async () => {
      const unitsToPurchase = sellOrder.fractionQty;
      const wrongFractionPriceCents = 1;
      try {
        await SellOrderPurchase.from(buyer, sellOrder, {
          fractionsToPurchase: unitsToPurchase,
          fractionPriceCents: wrongFractionPriceCents,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(PriceMismatchException);
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should throw error if buyer userId matches seller userId', async () => {
      const unitsToPurchase = sellOrder.fractionQty;
      try {
        await SellOrderPurchase.from(seller, sellOrder, {
          fractionsToPurchase: unitsToPurchase,
          fractionPriceCents: sellOrder.fractionPriceCents,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UserCannotPurchaseOwnOrderException);
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should throw error if start date is in the future', async () => {
      const futureSellOrder = await createSellOrder({
        assetId: asset.id,
        partnerId: partner.id,
        userId: seller.id,
        type: SellOrderTypeEnum.standard,
        fractionQty: initialQty,
        fractionPriceCents: 100,
        startTime: new Date(new Date().getTime() + 1000),
      });
      const unitsToPurchase = sellOrder.fractionQty;
      try {
        await SellOrderPurchase.from(buyer, futureSellOrder, {
          fractionsToPurchase: unitsToPurchase,
          fractionPriceCents: futureSellOrder.fractionPriceCents,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(SellOrderNotFoundException);
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should throw error if expire time is in the past', async () => {
      const futureSellOrder = await createSellOrder({
        assetId: asset.id,
        partnerId: partner.id,
        userId: seller.id,
        type: SellOrderTypeEnum.standard,
        fractionQty: initialQty,
        fractionPriceCents: 100,
        expireTime: new Date(new Date().getTime() - 1000),
      });
      const unitsToPurchase = sellOrder.fractionQty;
      try {
        await SellOrderPurchase.from(buyer, futureSellOrder, {
          fractionsToPurchase: unitsToPurchase,
          fractionPriceCents: futureSellOrder.fractionPriceCents,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(SellOrderNotFoundException);
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should throw if sellOrder drop does not have a userFractionLimit', async () => {
      const unitsToPurchase = 1;
      const brokenSellOrderDrop = await createSellOrder({
        ...sellOrder,
        type: SellOrderTypeEnum.drop,
        userFractionLimit: undefined,
        userFractionLimitEndTime: faker.date.future(),
      });
      try {
        await SellOrderPurchase.from(buyer, brokenSellOrderDrop, {
          fractionsToPurchase: unitsToPurchase,
          fractionPriceCents: brokenSellOrderDrop.fractionPriceCents,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.response.message).toBe('User fraction limit is not set');
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should throw error if sellOrder drop does not specify end time', async () => {
      const unitsToPurchase = 1;
      const brokenSellOrderDrop = await createSellOrder({
        ...sellOrder,
        type: SellOrderTypeEnum.drop,
        userFractionLimit: 10,
        userFractionLimitEndTime: undefined,
      });
      try {
        await SellOrderPurchase.from(buyer, brokenSellOrderDrop, {
          fractionsToPurchase: unitsToPurchase,
          fractionPriceCents: brokenSellOrderDrop.fractionPriceCents,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.response.message).toBe('User fraction limit end time is not set');
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should throw error if user tries to buy more than drop limit', async () => {
      const unitsToPurchase = sellOrderDrop.userFractionLimit + 1;

      try {
        await SellOrderPurchase.from(buyer, sellOrderDrop, {
          fractionsToPurchase: unitsToPurchase,
          fractionPriceCents: sellOrderDrop.fractionPriceCents,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(PurchaseLimitReached);
        return;
      }
      throw new Error('Error did not throw');
    });
  });

  test('should throw error if user already has bought shares of a drop and tries to buy more than their limit', async () => {
    const unitsToPurchase = 6;
    await SellOrderPurchase.from(buyer, sellOrderDrop, {
      fractionsToPurchase: unitsToPurchase,
      fractionPriceCents: sellOrderDrop.fractionPriceCents,
    });
    try {
      await SellOrderPurchase.from(buyer, sellOrderDrop, {
        fractionsToPurchase: unitsToPurchase,
        fractionPriceCents: sellOrderDrop.fractionPriceCents,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(PurchaseLimitReached);
      return;
    }
    throw new Error('Error did not throw');
  });

  test('should throw if seller does not own asset', async () => {
    const testAsset = await createAsset({ refId: '4', name: 'Drop' }, partner);
    const testSellOrder = await createSellOrder({
      assetId: testAsset.id,
      partnerId: partner.id,
      userId: seller.id,
      type: SellOrderTypeEnum.standard,
      fractionQty: initialQty,
      fractionPriceCents: 100,
    });

    const unitsToPurchase = 1;

    try {
      await SellOrderPurchase.from(buyer, testSellOrder, {
        fractionsToPurchase: unitsToPurchase,
        fractionPriceCents: testSellOrder.fractionPriceCents,
      });
    } catch (error) {
      console.log(error);
      expect(error).toBeInstanceOf(SellerNotAssetOwnerException);
      return;
    }
    throw new Error('Error did not throw');
  });

  test('should throw if seller does not own asset enough fractions to cover sellOrder', async () => {
    const testAsset = await createAsset({ refId: '4', name: 'Drop' }, partner);
    const testSellOrder = await createSellOrder({
      assetId: testAsset.id,
      partnerId: partner.id,
      userId: seller.id,
      type: SellOrderTypeEnum.standard,
      fractionQty: initialQty,
      fractionPriceCents: 100,
    });

    await createUserAsset({
      assetId: testSellOrder.assetId,
      userId: testSellOrder.userId,
      quantityOwned: 1,
    });

    const unitsToPurchase = 2;

    try {
      await SellOrderPurchase.from(buyer, testSellOrder, {
        fractionsToPurchase: unitsToPurchase,
        fractionPriceCents: testSellOrder.fractionPriceCents,
      });
    } catch (error) {
      console.log(error);
      expect(error).toBeInstanceOf(NotEnoughUnitsFromSeller);
      return;
    }
    throw new Error('Error did not throw');
  });

  test('should create userAsset for buyer userAsset for asset does not already exist', async () => {
    const unitsToPurchase = 2;

    await SellOrderPurchase.from(buyer, sellOrder, {
      fractionsToPurchase: unitsToPurchase,
      fractionPriceCents: sellOrder.fractionPriceCents,
    });
    test.todo;
  });
});
