import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { Partner } from 'modules/partners/entities';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { Asset } from 'modules/assets/entities';
import { createAsset } from '../utils/asset.utils';
import * as testApp from '../utils/app.utils';
import { SellOrder, SellOrderPurchase } from 'modules/sell-orders/entities';
import { createSellOrder } from '../utils/sell-order.utils';
import { SellOrderTypeEnum } from 'modules/sell-orders/enums/sell-order-type.enum';
import { generateOtpToken } from '../utils/jwt.utils';

describe('SellOrdersController -> Purchases', () => {
  const initialQty = 10000;
  let app: INestApplication;
  let partner: Partner;
  let partnerUser: User;
  let asset: Asset;
  let sellOrder: SellOrder;
  let header;
  let baseUrl: string;
  let seller: User;
  let buyer: User;

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
    baseUrl = '/v1/sellorders/' + sellOrder.id + '/purchase';
    header = { Authorization: `Bearer ${generateOtpToken(buyer)}` };
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await clearAllData();
  });

  describe(`Sell Order purchases`, () => {
    test('should throw 401 exception if jwt is missing', () => {
      return testApp.post(app, baseUrl, 401, null, {}, {});
    });

    test('Should return 201 and purchase sell order', async () => {
      const fractionsToPurchase = 10;
      const fractionPriceCents = sellOrder.fractionPriceCents;
      const payload = { fractionsToPurchase, fractionPriceCents };
      await testApp.post(app, baseUrl, 201, null, payload, header);
      await sellOrder.reload();
      expect(sellOrder.fractionQtyAvailable).toBe(initialQty - fractionsToPurchase);
      const purchase = await SellOrderPurchase.findOne({ sellOrderId: sellOrder.id });
      expect(purchase).toBeDefined();
      expect(purchase.fractionQty).toBe(fractionsToPurchase);
      expect(purchase.fractionPriceCents).toBe(fractionPriceCents);
    });

    // TODO more tests
  });
});
