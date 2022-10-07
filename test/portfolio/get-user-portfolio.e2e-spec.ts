import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { Partner } from 'modules/partners/entities';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { Asset } from 'modules/assets/entities';
import { Event } from 'modules/events/entities';
import { createAsset } from '../utils/asset.utils';
import { SellOrder, SellOrderPurchase } from 'modules/sell-orders/entities';
import { createSellOrder, expectPurchaseSuccess } from '../utils/sell-order.utils';
import { SellOrderTypeEnum } from 'modules/sell-orders/enums/sell-order-type.enum';
import { generateToken } from '../utils/jwt.utils';
import request from 'supertest';
import { PortfolioTransformer } from 'modules/portfolio/portfolio.transformer';
import { IPortfolioResponse } from 'modules/portfolio/interfaces/portfolio-response.interface';

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
      },
      partner,
    );
    asset2 = await createAsset(
      {
        refId: '2',
        name: 'Cat',
        description: 'test-cat',
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
  });

  afterEach(async () => {
    await SellOrderPurchase.delete({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await Event.delete({});
    await SellOrderPurchase.delete({});
    await SellOrder.delete({});
    await Asset.delete({});
    await Partner.delete({});
    await User.delete({});
    await clearAllData();
  });

  describe(`GET V1 /`, () => {
    test('should return all sell order purchases for the buyer', async () => {
      const headers = { Authorization: `Bearer ${generateToken(buyer)}` };
      //buyer purchases 2 different assets from seller.
      const purchase = await expectPurchaseSuccess(
        app,
        sellOrder,
        10,
        sellOrder.fractionPriceCents,
        buyer,
        headers,
      );
      const purchase2 = await expectPurchaseSuccess(
        app,
        sellOrder2,
        20,
        sellOrder2.fractionPriceCents,
        buyer,
        headers,
      );

      const result: IPortfolioResponse = {
        totalValueInCents:
          purchase.fractionQty * purchase.fractionPriceCents +
          purchase2.fractionQty * purchase2.fractionPriceCents,
        totalUnits: purchase.fractionQty + purchase2.fractionQty,
        purchaseHistory: [
          Object.assign(purchase, { asset: asset }),
          Object.assign(purchase2, { asset: asset2 }),
        ],
        sellOrderHistory: [],
      };

      await request(app.getHttpServer())
        .get(PORTFOLIO_URL)
        .set(headers)
        .expect(200)
        .expect((res) => {
          expect(res.body.totalUnits).toBe(result.totalUnits);
          expect(res.body.totalValueInCents).toEqual(result.totalValueInCents);
          expect(res.body.sellOrderHistory.length).toEqual(0);
          expect(res.body.purchaseHistory[0]).toHaveProperty('asset');
          expect(res.body).toStrictEqual(portfolioTransformer.transformPortfolio(result));
        });
    });

    test('should return all active sell orders for a seller', async () => {
      const headers = { Authorization: `Bearer ${generateToken(seller)}` };

      const result: IPortfolioResponse = {
        totalValueInCents: 0,
        totalUnits: 0,
        purchaseHistory: [],
        sellOrderHistory: [
          Object.assign(sellOrder, { asset: asset }),
          Object.assign(sellOrder2, { asset: asset2 }),
        ],
      };

      await request(app.getHttpServer())
        .get(PORTFOLIO_URL)
        .set(headers)
        .expect(200)
        .expect((res) => {
          expect(res.body.sellOrderHistory.length).toEqual(2);
          expect(res.body).toStrictEqual(portfolioTransformer.transformPortfolio(result));
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
