import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { Partner } from 'modules/partners/entities';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { Asset } from 'modules/assets/entities';
import { createAsset } from '../utils/asset.utils';
import { SellOrder, SellOrderPurchase } from 'modules/sell-orders/entities';
import { createSellOrder, expectPurchaseSuccess } from '../utils/sell-order.utils';
import { SellOrderTypeEnum } from 'modules/sell-orders/enums/sell-order-type.enum';
import { generateToken } from '../utils/jwt.utils';
import request from 'supertest';
import { PortfolioTransformer } from 'modules/portfolio/portfolio.transformer';
import { IPortfolioResponse } from 'modules/portfolio/interfaces/portfolio-response.interface';
import { createUserAsset } from '../utils/user';
import { UserAsset } from 'modules/users/entities/user-assets.entity';
import { PortfolioResponse } from 'modules/portfolio/responses';

describe('PortfolioController', () => {
  const initialQty = 10000;
  let app: INestApplication;
  let partner: Partner;
  let asset: Asset;
  let asset2: Asset;
  let sellOrder: SellOrder;
  let sellOrder2: SellOrder;
  let seller: User;
  let buyer: User;
  let portfolioTransformer: PortfolioTransformer;
  let userAsset: UserAsset;
  let userAsset2: UserAsset;
  const PORTFOLIO_URL = `/v1/portfolio/`;

  beforeAll(async () => {
    app = await createApp();
    portfolioTransformer = app.get(PortfolioTransformer);
    seller = await createUser({ email: 'seller@test.com', role: RoleEnum.USER });
    buyer = await createUser({ email: 'buyer@test.com', role: RoleEnum.USER });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: seller,
    });
    asset = await createAsset(
      {
        refId: '1',
        name: 'ferret',
        description: 'test-ferret',
        attributes: [
          { trait: 'Category', value: 'Baseball' },
          { trait: 'Grade', value: '10' },
        ],
      },
      partner,
    );
    asset2 = await createAsset(
      {
        refId: '2',
        name: 'Cat',
        description: 'test-cat',
        attributes: [
          { trait: 'Category', value: 'Baseball' },
          { trait: 'Grade', value: '10' },
        ],
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
    sellOrder2 = await createSellOrder({
      assetId: asset2.id,
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
    userAsset2 = await createUserAsset({
      assetId: sellOrder2.assetId,
      userId: sellOrder2.userId,
      quantityOwned: sellOrder2.fractionQty,
    });
  });

  afterEach(async () => {
    await SellOrderPurchase.delete({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`GET V1 /`, () => {
    test('should return all sell order purchases for the buyer', async () => {
      const headers = { Authorization: `Bearer ${generateToken(buyer)}` };
      //buyer purchases 2 different assets from seller.
      const unitsToBuyFromAsset1 = 10;
      const unitsToBuyFromAsset2 = 20;
      const purchase = await expectPurchaseSuccess(
        app,
        sellOrder,
        unitsToBuyFromAsset1,
        sellOrder.fractionPriceCents,
        buyer,
        headers,
      );
      const purchase2 = await expectPurchaseSuccess(
        app,
        sellOrder2,
        unitsToBuyFromAsset2,
        sellOrder2.fractionPriceCents,
        buyer,
        headers,
      );

      const mockResult: PortfolioResponse = {
        totalValueInCents:
          unitsToBuyFromAsset1 * sellOrder.fractionPriceCents +
          unitsToBuyFromAsset2 * sellOrder2.fractionPriceCents,
        totalUnits: unitsToBuyFromAsset1 + unitsToBuyFromAsset2,
      };

      await request(app.getHttpServer())
        .get(PORTFOLIO_URL)
        .set(headers)
        .expect(200)
        .expect((res) => {
          expect(res.body.totalUnits).toBe(mockResult.totalUnits);
          expect(res.body.totalValueInCents).toEqual(mockResult.totalValueInCents);
          expect(res.body.sellOrderHistory.length).toEqual(0);
          expect(res.body.purchaseHistory[0]).toHaveProperty('asset');
          expect(res.body).toMatchObject(portfolioTransformer.transformPortfolio(mockResult));
        });
    });

    test('should return all active sell orders for a seller', async () => {
      const headers = { Authorization: `Bearer ${generateToken(seller)}` };

      const mockResult: IPortfolioResponse = {
        totalValueInCents: 0,
        totalUnits: 0,
        assetPurchaseHistory: [],
        sellOrderHistory: [
          Object.assign(sellOrder2, { asset: asset2 }),
          Object.assign(sellOrder, { asset: asset }),
        ],
      };
      const mockResultTransformed = portfolioTransformer.transformPortfolio(mockResult);
      await request(app.getHttpServer())
        .get(PORTFOLIO_URL)
        .set(headers)
        .expect(200)
        .expect((res) => {
          expect(res.body.sellOrderHistory.length).toEqual(2);
          expect(res.body).toMatchObject({
            ...mockResultTransformed,
          });
        });
    });

    test('should error if request is sent with improper authorization', async () => {
      const headers = { Authorization: `improper authorization` };

      await request(app.getHttpServer())
        .get(PORTFOLIO_URL)
        .set(headers)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Unauthorized');
        });
    });
  });
});
