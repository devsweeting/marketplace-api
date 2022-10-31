import { INestApplication } from '@nestjs/common';
import { Asset } from 'modules/assets/entities';
import { Partner } from 'modules/partners/entities';
import { SellOrder } from 'modules/sell-orders/entities';
import { SellOrderTypeEnum } from 'modules/sell-orders/enums/sell-order-type.enum';
import { User } from 'modules/users/entities';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { clearAllData, createApp } from '../utils/app.utils';
import { createAsset } from '../utils/asset.utils';
import { createUser } from '../utils/create-user';
import { createPartner } from '../utils/partner.utils';
import { createSellOrder } from '../utils/sell-order.utils';
import { createUserAsset } from '../utils/user';
import { PortfolioService } from ../utils/create-user-assetfolio/portfolio.service';
import { UserAsset } from 'modules/users/entities/user-assets.entity';
let app: INestApplication;
const initialQty = 10000;

let service: PortfolioService;
let partner: Partner;
let partnerUser: User;
let asset: Asset;
let sellOrder: SellOrder;
let userWithAssets: User;
let userWithoutAssets: User;
let userAsset: UserAsset;
beforeAll(async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app = await createApp();
});

beforeEach(async () => {
  partnerUser = await createUser({ email: 'partner1@test.com', role: RoleEnum.USER });
  userWithAssets = await createUser({ email: 'user1@test.com', role: RoleEnum.USER });
  userWithoutAssets = await createUser({ email: 'user2@test.com', role: RoleEnum.USER });
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
    userId: userWithAssets.id,
    type: SellOrderTypeEnum.standard,
    fractionQty: initialQty,
    fractionPriceCents: 100,
  });

  userAsset = await createUserAsset({
    assetId: sellOrder.assetId,
    userId: sellOrder.userId,
    quantityOwned: sellOrder.fractionQty,
  });
  service = new PortfolioService();
});

afterEach(async () => {
  jest.clearAllMocks();
  await clearAllData();
});

describe('portfolio Service', () => {
  describe('getUserOwnedAssets', () => {
    test('should return assets owned by user', async () => {
      const assets = await service.getUserOwnedAssets(userWithAssets);
      expect(assets[0].id).toBe(asset.id);
    });
    test('should return undefined if user does not own any assets', async () => {
      const assets = await service.getUserOwnedAssets(userWithoutAssets);
      expect(assets).toStrictEqual([]);
    });
  });

  describe('getTotalPurchased', () => {
    test('should return total assets owned by user and the valuation of those assets', async () => {
      const result = await service.getTotalPurchased(userWithAssets);
      expect(result).toMatchObject({
        totalUnits: userAsset.quantityOwned,
        totalValueInCents: userAsset.quantityOwned * sellOrder.fractionPriceCents,
      });
    });
    test('should return zero if the user does not own any assets', async () => {
      const result = await service.getTotalPurchased(userWithoutAssets);
      expect(result).toMatchObject({
        totalUnits: 0,
        totalValueInCents: 0,
      });
    });
  });
});
