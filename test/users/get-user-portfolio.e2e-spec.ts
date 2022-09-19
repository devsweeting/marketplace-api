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
import * as testApp from '../utils/app.utils';
import { generateOtpToken } from '../utils/jwt.utils';

describe('SellOrdersController', () => {
  const initialQty = 10000;
  let app: INestApplication;
  let partner: Partner;
  let asset: Asset;
  let asset2: Asset;
  let sellOrder: SellOrder;
  let sellOrder2: SellOrder;
  let seller: User;
  let buyer: User;

  const PORTFOLIO_URL = `/v1/users/portfolio/`;
  // const GET_USER_URL = `/v1/users/`;

  // async function expectSignInSuccess(url, user) {
  //   return request(app.getHttpServer())
  //     .get(url)
  //     .set({ Authorization: `Bearer ${generateToken(user)}` })
  //     .expect(200);
  // }

  beforeAll(async () => {
    app = await createApp();
  });

  beforeEach(async () => {
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
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await Event.delete({});
    await SellOrderPurchase.delete({}); //delete the foreign key on SellOrder first
    await SellOrder.delete({});
    await Asset.delete({});
    await Partner.delete({});
    await User.delete({});
    await clearAllData();
  });

  describe(`GET V1 /`, () => {
    test('should return all sell order purchases for the buyer', async () => {
      const headers = { Authorization: `Bearer ${generateOtpToken(buyer)}` };
      //buyer purchases 2 different assets from seller.
      console.log('sellOrder', sellOrder);
      await expectPurchaseSuccess(app, sellOrder, 10, sellOrder.fractionPriceCents, buyer, headers);
      await expectPurchaseSuccess(
        app,
        sellOrder2,
        20,
        sellOrder2.fractionPriceCents,
        buyer,
        headers,
      );

      // await sellOrder.reload();
      const expectedResponse = { status: 'it works' };
      await testApp.get(app, PORTFOLIO_URL + buyer.id, 200, expectedResponse, {}, headers);
    });
  });
});
