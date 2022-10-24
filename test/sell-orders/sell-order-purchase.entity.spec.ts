import { faker } from '@faker-js/faker';
import { InternalServerErrorException } from '@nestjs/common';
import { Asset } from 'modules/assets/entities';
import { Partner } from 'modules/partners/entities';
import { SellOrder, SellOrderPurchase } from 'modules/sell-orders/entities';
import { SellOrderTypeEnum } from 'modules/sell-orders/enums/sell-order-type.enum';
import {
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
beforeAll(async () => {
  await createApp();
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

  await createUserAsset({
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
        expect(error).toBeInstanceOf(NotEnoughUnitsFromSeller);
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should create userAsset for buyer userAsset if userAsset does not already exist', async () => {
      const unitsToPurchase = 2;
      const manager = SellOrderPurchase.getRepository().manager;
      const userAsset = await manager.findOne(UserAsset, {
        where: { userId: buyer.id, assetId: sellOrder.assetId, isDeleted: false },
      });
      expect(userAsset).toBeNull();
      await SellOrderPurchase.from(buyer, sellOrder, {
        fractionsToPurchase: unitsToPurchase,
        fractionPriceCents: sellOrder.fractionPriceCents,
      });
      const newUserAsset = await manager.findOne(UserAsset, {
        where: { userId: buyer.id, assetId: sellOrder.assetId, isDeleted: false },
      });
      expect(newUserAsset).toMatchObject({
        ...newUserAsset,
        quantityOwned: unitsToPurchase,
      });
    });

    test('should correctly process purchase', async () => {
      const unitsToPurchase = 2;
      const oldSellOrderFractionQtyAvailable = sellOrder.fractionQtyAvailable;
      const oldSellerUserAssetQty = userAsset.quantityOwned;
      const manager = SellOrderPurchase.getRepository().manager;
      const buyerUserAsset = await manager.findOne(UserAsset, {
        where: { userId: buyer.id, assetId: sellOrder.assetId, isDeleted: false },
      });
      expect(buyerUserAsset).toBeNull();
      await SellOrderPurchase.from(buyer, sellOrder, {
        fractionsToPurchase: unitsToPurchase,
        fractionPriceCents: sellOrder.fractionPriceCents,
      });
      const newBuyerUserAsset = await manager.findOne(UserAsset, {
        where: { userId: buyer.id, assetId: sellOrder.assetId, isDeleted: false },
      });
      await sellOrder.reload();
      await userAsset.reload();
      expect(newBuyerUserAsset).toMatchObject({
        ...newBuyerUserAsset,
        quantityOwned: unitsToPurchase,
      });
      expect(sellOrder).toMatchObject({
        ...sellOrder,
        fractionQtyAvailable: oldSellOrderFractionQtyAvailable - unitsToPurchase,
      });
      expect(userAsset).toMatchObject({
        ...userAsset,
        quantityOwned: oldSellerUserAssetQty - unitsToPurchase,
      });
      // Buy the same assets again
      await SellOrderPurchase.from(buyer, sellOrder, {
        fractionsToPurchase: unitsToPurchase,
        fractionPriceCents: sellOrder.fractionPriceCents,
      });
      const newPurchasedAmount = unitsToPurchase + unitsToPurchase;
      await sellOrder.reload();
      await userAsset.reload();
      await newBuyerUserAsset.reload();
      expect(newBuyerUserAsset).toMatchObject({
        ...newBuyerUserAsset,
        quantityOwned: newPurchasedAmount,
      });
      expect(sellOrder).toMatchObject({
        ...sellOrder,
        fractionQtyAvailable: oldSellOrderFractionQtyAvailable - newPurchasedAmount,
      });
      expect(userAsset).toMatchObject({
        ...userAsset,
        quantityOwned: oldSellerUserAssetQty - newPurchasedAmount,
      });
    });
  });

  describe('getTotalPurchased', () => {
    test('should return 0 if the user has not bought any assets', async () => {
      const totalPurchased = await SellOrderPurchase.getTotalPurchased(buyer, sellOrder);
      expect(totalPurchased).toBe(0);
    });

    test('should return number of units a user has bought', async () => {
      const unitsToPurchase = 2;
      await SellOrderPurchase.from(buyer, sellOrder, {
        fractionsToPurchase: unitsToPurchase,
        fractionPriceCents: sellOrder.fractionPriceCents,
      });
      const totalPurchased = await SellOrderPurchase.getTotalPurchased(buyer, sellOrder);
      expect(totalPurchased).toBe(unitsToPurchase.toString());
    });
  });
});
