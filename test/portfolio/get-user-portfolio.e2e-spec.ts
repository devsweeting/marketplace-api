import { INestApplication, HttpStatus } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { Partner } from 'modules/partners/entities';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { Asset } from 'modules/assets/entities';
import { createAsset } from '../utils/asset.utils';
import { SellOrder } from 'modules/sell-orders/entities';
import { createSellOrder, expectPurchaseSuccess } from '../utils/sell-order.utils';
import { SellOrderTypeEnum } from 'modules/sell-orders/enums/sell-order-type.enum';
import { generateToken } from '../utils/jwt.utils';
import request from 'supertest';
import { createUserAsset } from '../utils/create-user-asset';
import { UserAsset } from 'modules/users/entities/user-assets.entity';
import { AssetsTransformer } from 'modules/assets/transformers/assets.transformer';
import { PortfolioTransformer } from 'modules/portfolio/transformers/portfolio.transformer';

describe('PortfolioController', () => {
  const initialQty = 10000;
  let app: INestApplication;
  let partner: Partner;
  let partnerUser: User;

  let asset: Asset;
  let asset2: Asset;
  let sellOrder: SellOrder;
  let sellOrder2: SellOrder;
  let seller: User;
  let buyer: User;
  let portfolioTransformer: PortfolioTransformer;
  let userAsset: UserAsset;
  let userAsset2: UserAsset;
  let buyerUserAsset: UserAsset;
  let buyerUserAsset2: UserAsset;
  let headers;
  const PORTFOLIO_URL = `/v1/portfolio`;

  beforeAll(async () => {
    app = await createApp();
    app.get(AssetsTransformer);
    portfolioTransformer = app.get(PortfolioTransformer);
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
    asset2 = await createAsset(
      {
        refId: '2',
        name: 'Wheat',
        description: 'test-wheat',
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
    buyerUserAsset = await createUserAsset({
      assetId: sellOrder.assetId,
      userId: buyer.id,
      quantityOwned: 0,
    });

    buyerUserAsset2 = await createUserAsset({
      assetId: sellOrder2.assetId,
      userId: buyer.id,
      quantityOwned: 0,
    });
    asset.sellOrders = [sellOrder];
    asset.userAsset = userAsset;
    asset2.sellOrders = [sellOrder2];
    asset2.userAsset = userAsset2;
    headers = { Authorization: `Bearer ${generateToken(buyer)}` };
  });

  afterEach(async () => {
    await clearAllData();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`GET V1 /`, () => {
    test('should return all sell order purchases for the buyer', async () => {
      //buyer purchases 2 different assets from seller.
      const unitsToBuyFromAsset1 = 10;
      const unitsToBuyFromAsset2 = 20;
      await expectPurchaseSuccess(
        app,
        sellOrder,
        unitsToBuyFromAsset1,
        sellOrder.fractionPriceCents,
        buyer,
        headers,
      );
      await expectPurchaseSuccess(
        app,
        sellOrder2,
        unitsToBuyFromAsset2,
        sellOrder2.fractionPriceCents,
        buyer,
        headers,
      );
      buyerUserAsset.quantityOwned = unitsToBuyFromAsset1;
      buyerUserAsset2.quantityOwned = unitsToBuyFromAsset2;
      asset.userAsset = buyerUserAsset;
      asset2.userAsset = buyerUserAsset2;
      await request(app.getHttpServer())
        .get(PORTFOLIO_URL)
        .set(headers)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.totalUnits).toBe(unitsToBuyFromAsset1 + unitsToBuyFromAsset2);
          expect(res.body.totalValueInCents).toEqual(
            unitsToBuyFromAsset1 * sellOrder.fractionPriceCents +
              unitsToBuyFromAsset2 * sellOrder2.fractionPriceCents,
          );
          expect(res.body).toEqual(
            expect.objectContaining(
              portfolioTransformer.transformPortfolio({
                totalValueInCents:
                  unitsToBuyFromAsset1 * sellOrder.fractionPriceCents +
                  unitsToBuyFromAsset2 * sellOrder2.fractionPriceCents,
                totalUnits: unitsToBuyFromAsset1 + unitsToBuyFromAsset2,
                paginatedOwnedAssets: {
                  meta: {
                    totalItems: 2,
                    itemCount: 2,
                    itemsPerPage: 25,
                    totalPages: 1,
                    currentPage: 1,
                  },
                  items: [asset2, asset],
                },
              }),
            ),
          );
        });
    });

    test('should error if request is sent with improper authorization', async () => {
      const headers = { Authorization: `improper authorization` };

      await request(app.getHttpServer())
        .get(PORTFOLIO_URL)
        .set(headers)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect((res) => {
          expect(res.body.message).toBe('Unauthorized');
        });
    });
  });

  // test('should filter out assets from params', async () => {
  //   await request(app.getHttpServer())
  //     .get(PORTFOLIO_URL + '?query=Egg')
  //     .set(headers)
  //     .expect(200)
  //     .expect((res) => {
  //       expect(res.body.totalUnits).toBe(0);
  //       expect(res.body.totalValueInCents).toEqual(0);
  //       expect(res.body).toEqual(
  //         expect.objectContaining(
  //           portfolioTransformer.transformPortfolio({
  //             totalValueInCents: 1,
  //             totalUnits: 2,
  //             paginatedOwnedAssets: {
  //               meta: {
  //                 totalItems: 2,
  //                 itemCount: 2,
  //                 itemsPerPage: 25,
  //                 totalPages: 1,
  //                 currentPage: 1,
  //               },
  //               items: [asset],
  //             },
  //           }),
  //         ),
  //       );
  //     });
  // });
});
