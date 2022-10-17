import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Asset } from 'modules/assets/entities';
import { AssetNotFoundException } from 'modules/assets/exceptions';
import { UserNotFoundException } from 'modules/common/exceptions/user-not-found.exception';
import { Partner } from 'modules/partners/entities';
import { SellOrderDto } from 'modules/sell-orders/dto';
import { SellOrder } from 'modules/sell-orders/entities';
import { SellOrderTypeEnum } from 'modules/sell-orders/enums/sell-order-type.enum';
import { SellOrdersService } from 'modules/sell-orders/sell-orders.service';
import { User } from 'modules/users/entities';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { clearAllData, createApp } from '../utils/app.utils';
import { createAsset } from '../utils/asset.utils';
import { createUser } from '../utils/create-user';
import { createPartner } from '../utils/partner.utils';
import { createSellOrder } from '../utils/sell-order.utils';
import { createUserAsset } from '../utils/user';
import {
  InvalidUserFractionLimitEndTimeException,
  InvalidUserFractionLimitException,
  NotEnoughFractionsForSellOrderException,
  PurchaseLimitReached,
  SellOrderNotFoundException,
} from 'modules/sell-orders/exceptions';

let app: INestApplication;
const initialQty = 10000;
const fakeUUID = '39353a36-4b28-11ed-b878-0242ac120002';

let service: SellOrdersService;
let partner: Partner;
let partnerUser: User;
let asset: Asset;
let sellOrder: SellOrder;
let assetDrop: Asset;
let sellOrderDrop: SellOrder;
let seller: User;
let buyer: User;
beforeAll(async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  await createUserAsset({
    assetId: sellOrder.assetId,
    userId: sellOrder.userId,
    quantityOwned: sellOrder.fractionQty,
  });

  await createUserAsset({
    assetId: sellOrderDrop.assetId,
    userId: sellOrderDrop.userId,
    quantityOwned: sellOrderDrop.fractionQty,
  });
  service = new SellOrdersService();
});

afterEach(async () => {
  jest.clearAllMocks();
  await clearAllData();
});

describe('SellOrdersService', () => {
  describe('getOne', () => {
    test('should throw error if sellOrder is undefined', async () => {
      try {
        await service.getOne({ id: fakeUUID });
      } catch (error) {
        expect(error).toBeInstanceOf(SellOrderNotFoundException);
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should return sellOrder', async () => {
      const returnedSellOrder = await service.getOne(sellOrder);
      expect(returnedSellOrder.id).toBe(sellOrder.id);
    });
  });

  describe('createSellOrder', () => {
    test('should throw if no asset is found', async () => {
      try {
        await service.createSellOrder({ id: fakeUUID }, {
          id: fakeUUID,
        } as unknown as SellOrderDto);
      } catch (error) {
        expect(error).toBeInstanceOf(AssetNotFoundException);
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should throw if no user is found', async () => {
      try {
        await service.createSellOrder({ id: partner.id }, {
          id: sellOrder.id,
          email: 'fakeEmail@example.com',
        } as unknown as SellOrderDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UserNotFoundException);
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should throw if asset qty is less than sellOrder qty', async () => {
      try {
        await service.createSellOrder({ id: partner.id }, {
          id: sellOrder.id,
          email: 'seller@test.com',
          fractionQty: 1001,
        } as unknown as SellOrderDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotEnoughFractionsForSellOrderException);
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should throw if asset qty is less than sellOrder qty', async () => {
      try {
        await service.createSellOrder({ id: partner.id }, {
          id: sellOrder.id,
          email: 'seller@test.com',
          fractionQty: 1001,
        } as unknown as SellOrderDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotEnoughFractionsForSellOrderException);
        return;
      }
      throw new Error('Error did not throw');
    });
    test('should throw if sellOrder drop does not have userFractionLimit', async () => {
      try {
        await service.createSellOrder({ id: partner.id }, {
          id: sellOrderDrop.id,
          email: 'seller@test.com',
          fractionQty: 1000,
          type: 'drop',
        } as unknown as SellOrderDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidUserFractionLimitException);
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should throw if sellOrder drop userFractionLimit is greater than asset amount', async () => {
      try {
        await service.createSellOrder({ id: partner.id }, {
          id: sellOrderDrop.id,
          email: 'seller@test.com',
          fractionQty: 1000,
          userFractionLimit: 1001,
          type: 'drop',
        } as unknown as SellOrderDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidUserFractionLimitException);
        return;
      }
      throw new Error('Error did not throw');
    });
    test('should throw if sellOrder drop does not have end time', async () => {
      try {
        await service.createSellOrder({ id: partner.id }, {
          id: sellOrderDrop.id,
          email: 'seller@test.com',
          fractionQty: 1000,
          userFractionLimit: 1000,
          userFractionLimitEndTime: undefined,
          type: 'drop',
        } as unknown as SellOrderDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidUserFractionLimitEndTimeException);
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should throw if sellOrder end time is before start time', async () => {
      try {
        await service.createSellOrder({ id: partner.id }, {
          id: sellOrderDrop.id,
          email: 'seller@test.com',
          fractionQty: 1000,
          userFractionLimit: 1000,
          userFractionLimitEndTime: new Date(),
          startTime: new Date(new Date().getTime() + 1000),
          type: 'drop',
        } as unknown as SellOrderDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidUserFractionLimitEndTimeException);
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should create a new sellOrder', async () => {
      const newSellOrder = await service.createSellOrder({ id: partner.id }, {
        id: sellOrderDrop.id,
        email: 'seller@test.com',
        fractionQty: 1000,
      } as unknown as SellOrderDto);

      expect(newSellOrder).toMatchObject({
        id: newSellOrder.id,
        updatedAt: newSellOrder.updatedAt,
        partnerId: newSellOrder.partnerId,
        deletedAt: null,
        email: 'seller@test.com',
        fractionQty: 1000,
        userFractionLimit: null,
        userFractionLimitEndTime: null,
        userId: null,
      });
    });
  });
  describe('checkDrop', () => {
    test('should throw if sellOrder is a drop and purchased is greater than userFractionLimit', async () => {
      await service.purchase(buyer, sellOrderDrop, {
        fractionsToPurchase: sellOrderDrop.userFractionLimit,
        fractionPriceCents: sellOrderDrop.fractionPriceCents,
      });
      try {
        await service.checkDrop(buyer, sellOrderDrop);
      } catch (error) {
        expect(error).toBeInstanceOf(PurchaseLimitReached);
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should return number of units purchased for a drop sellOrder', async () => {
      const unitsToPurchase = 9;
      await service.purchase(buyer, sellOrderDrop, {
        fractionsToPurchase: unitsToPurchase,
        fractionPriceCents: sellOrderDrop.fractionPriceCents,
      });
      const unitsPurchased = await service.checkDrop(buyer, sellOrderDrop);
      expect(unitsPurchased).toBe(unitsToPurchase.toString());
    });
    test('should return number of units purchased for standard sellOrder', async () => {
      const unitsToPurchase = 9;
      await service.purchase(buyer, sellOrder, {
        fractionsToPurchase: unitsToPurchase,
        fractionPriceCents: sellOrder.fractionPriceCents,
      });
      const unitsPurchased = await service.checkDrop(buyer, sellOrder);
      expect(unitsPurchased).toBe(unitsToPurchase.toString());
    });
  });

  describe('deleteSellOrder', () => {
    test('should delete sellOrder', async () => {
      await service.deleteSellOrder(partner, sellOrder);
      try {
        await service.getOne(sellOrder);
      } catch (error) {
        expect(error).toBeInstanceOf(SellOrderNotFoundException);
        return;
      }
      throw new Error('Error did not throw');
    });
  });

  describe('purchase', () => {
    test('should return a sellOrderPurchase', async () => {
      const unitsToPurchase = 9;
      const sellOrderPurchase = await service.purchase(buyer, sellOrder, {
        fractionsToPurchase: unitsToPurchase,
        fractionPriceCents: sellOrder.fractionPriceCents,
      });
      expect(sellOrderPurchase).toMatchObject({
        ...sellOrderPurchase,
        fractionQty: unitsToPurchase,
      });
    });
  });

  describe('getUserSellOrder', () => {
    test('should get userSellOrder', async () => {
      const userSellOrders = await service.getUserSellOrders(seller);
      expect(userSellOrders).toBeDefined();
    });
  });
});
