import { INestApplication } from '@nestjs/common';
import { AssetsController } from 'modules/assets/controllers/assets.controller';
import { Asset } from 'modules/assets/entities';
import { AssetNotFoundException } from 'modules/assets/exceptions';

import { UserNotFoundException } from 'modules/common/exceptions/user-not-found.exception';
import { Partner } from 'modules/partners/entities';
import { SellOrderDto, SellOrderIdDto } from 'modules/sell-orders/dto';
import { SellOrder } from 'modules/sell-orders/entities';
import { SellOrderTypeEnum } from 'modules/sell-orders/enums/sell-order-type.enum';
import {
  NotEnoughFractionsForSellOrderException,
  SellOrderNotFoundException,
} from 'modules/sell-orders/exceptions';
import { SellOrdersService } from 'modules/sell-orders/sell-orders.service';

import { User } from 'modules/users/entities';
import { UserAsset } from 'modules/users/entities/user-assets.entity';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { BaseEntity } from 'typeorm';
import { clearAllData, createApp } from '../utils/app.utils';
import { createAsset } from '../utils/asset.utils';
import { createUser } from '../utils/create-user';
import { createPartner } from '../utils/partner.utils';
import { createSellOrder } from '../utils/sell-order.utils';
import { createUserAsset } from '../utils/user';
let app: INestApplication;
const initialQty = 10000;
const fakeUUID = '39353a36-4b28-11ed-b878-0242ac120002';

let service: SellOrdersService;
let assetsController: AssetsController;
let assetsService: Asset;
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
        expect(error).toBeInstanceOf(NotEnoughFractionsForSellOrderException);
        return;
      }
      throw new Error('Error did not throw');
    });
  });
  describe('checkDrop', () => {
    test('should first', async () => {
      test.todo;
    });
  });

  describe('deleteSellOrder', () => {
    test('should first', async () => {
      test.todo;
    });
  });

  describe('purchase', () => {
    test('should first', async () => {
      test.todo;
    });
  });

  describe('getUserSellOrder', () => {
    test('should first', async () => {
      test.todo;
    });
  });
});
