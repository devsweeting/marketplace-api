import { HttpStatus, INestApplication } from '@nestjs/common';
import { Partner } from 'modules/partners/entities';
import { User } from 'modules/users/entities';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { createApp } from '../utils/app.utils';
import { createUser } from '../utils/create-user';
import { createPartner } from '../utils/partner.utils';

import * as testApp from '../utils/app.utils';
import { createAsset } from '../utils/asset.utils';
import { Asset } from 'modules/assets/entities';
import { createSellOrder } from '../utils/sell-order.utils';

describe('Trending Markets', () => {
  let app: INestApplication;
  let partner: Partner;
  let user: User;
  let assets: Asset[];
  beforeAll(async () => {
    app = await createApp();
    user = await createUser({ email: 'partner@test.com', role: RoleEnum.USER });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
    assets = [
      await createAsset(
        {
          refId: '1',
          name: 'Michael Jordan #1',
          description: '',
          attributes: [{ trait: 'brand', value: 'Michael Jordan' }],
        },
        partner,
      ),
      await createAsset(
        {
          refId: '2',
          name: 'Michael Jordan #2',
          description: '',
          attributes: [{ trait: 'brand', value: 'Michael Jordan' }],
        },
        partner,
      ),
      await createAsset(
        {
          refId: '3',
          name: 'Steph Curry #2',
          description: '',
          attributes: [{ trait: 'brand', value: 'Stephen Curry' }],
        },
        partner,
      ),
      await createAsset(
        {
          refId: '4',
          name: 'Tiger Woods #1',
          description: '',
          attributes: [{ trait: 'brand', value: 'Tiger Woods' }],
        },
        partner,
      ),
    ];

    // Create 2 sell orders for the 2 Michael Jordan assets
    // 1000 cents total = $10
    await createSellOrder({
      assetId: assets[0].id,
      partnerId: partner.id,
      userId: user.id,
      fractionQty: 10,
      fractionPriceCents: 100,
    });
    // 1250 cents total = $12.50
    await createSellOrder({
      assetId: assets[1].id,
      partnerId: partner.id,
      userId: user.id,
      fractionQty: 5,
      fractionPriceCents: 250,
    });
    // Create 1 sell order for the 1 Steph Curry asset
    await createSellOrder({
      assetId: assets[2].id,
      partnerId: partner.id,
      userId: user.id,
      fractionQty: 30,
      fractionPriceCents: 110,
    });

    // Create 1 expensive sell order for the 1 Tiger Woods asset
    await createSellOrder({
      assetId: assets[3].id,
      partnerId: partner.id,
      userId: user.id,
      fractionQty: 100,
      fractionPriceCents: 10000,
    });

    // Soft-deleted items
    const deletedSellOrder = await createSellOrder({
      assetId: assets[0].id,
      partnerId: partner.id,
      userId: user.id,
      fractionQty: 1,
      fractionPriceCents: 999,
      deletedAt: new Date(),
    });
    deletedSellOrder.deletedAt = new Date();
    deletedSellOrder.isDeleted = true;
    await deletedSellOrder.save();

    const deletedAsset = await createAsset(
      {
        refId: '5',
        name: 'Tiger Woods #2',
        description: '',
        attributes: [{ trait: 'brand', value: 'Tiger Woods' }],
      },
      partner,
    );
    // "Active" sell order but attached to a soft-deleted asset
    await createSellOrder({
      assetId: deletedAsset.id,
      partnerId: partner.id,
      userId: user.id,
      fractionQty: 2,
      fractionPriceCents: 444,
    });
    deletedAsset.deletedAt = new Date();
    deletedAsset.isDeleted = true;
    await deletedAsset.save();
  });

  describe('GET /v1/trending', () => {
    test('should return list of trending markets, grouped by brand', async () => {
      const response = {
        markets: [
          {
            brand: 'Tiger Woods',
            filter: 'attr_eq[brand]=Tiger%20Woods',
            value_dollars: 10000,
          },

          {
            brand: 'Stephen Curry',
            filter: 'attr_eq[brand]=Stephen%20Curry',
            value_dollars: 33,
          },
          {
            brand: 'Michael Jordan',
            filter: 'attr_eq[brand]=Michael%20Jordan',
            value_dollars: 22.5,
          },
        ],
      };
      await testApp.get(app, `/v1/trending`, HttpStatus.OK, response, {});
    });
  });
});
