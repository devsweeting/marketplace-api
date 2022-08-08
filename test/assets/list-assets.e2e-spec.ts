import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { Asset, Attribute, Label, Media } from 'modules/assets/entities';
import { createAsset } from '@/test/utils/asset.utils';
import { AssetsTransformer } from 'modules/assets/transformers/assets.transformer';

import { Partner } from 'modules/partners/entities';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { createUser } from '../utils/create-user';
import { createPartner } from '../utils/partner.utils';
import { User } from 'modules/users/entities/user.entity';
import { Event } from 'modules/events/entities';
import * as testApp from '../utils/app.utils';
import { SellOrder } from 'modules/sell-orders/entities';

describe('AssetsController', () => {
  let app: INestApplication;
  let assets: Asset[];
  let partner: Partner;
  let user: User;
  let assetsTransformer: AssetsTransformer;

  async function doAssetSearch(
    paramStr: string,
    expectedAssets: Asset[],
    metaOverrides: object = {},
  ) {
    const params = new URLSearchParams(paramStr);
    const response = {
      meta: {
        totalItems: expectedAssets.length,
        itemCount: expectedAssets.length,
        itemsPerPage: 25,
        totalPages: expectedAssets.length > 0 ? 1 : 0,
        currentPage: 1,
        ...metaOverrides,
      },
      items: assetsTransformer.transformAll(expectedAssets),
    };
    return await testApp.get(app, `/v1/assets?${params}`, 200, response);
  }

  beforeAll(async () => {
    app = await createApp();
    assetsTransformer = app.get(AssetsTransformer);
    user = await createUser({ email: 'partner@test.com', role: RoleEnum.USER });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
  });

  beforeEach(async () => {
    assets = [
      await createAsset(
        {
          refId: '1',
          name: 'Egg',
          description: 'test-egg',
          attributes: [
            { trait: 'Category', value: 'Baseball' },
            { trait: 'Grade', value: '10' },
            { trait: 'Grading Service', value: 'BGS' },
            { trait: 'Year', value: '2014' },
          ],
        },
        partner,
      ),
      await createAsset(
        {
          refId: '2',
          name: 'Pumpkin',
          description: 'test-pumpkin',
          attributes: [
            { trait: 'Category', value: 'Baseball' },
            { trait: 'Grade', value: '2' },
            { trait: 'Grading Service', value: 'BGS' },
            { trait: 'Year', value: '2019' },
          ],
        },
        partner,
      ),
      await createAsset(
        {
          refId: '4',
          name: 'Water',
          description: 'test-water',
          attributes: [
            { trait: 'Category', value: 'Baseball' },
            { trait: 'Grade', value: '5' },
            { trait: 'Grading Service', value: 'PSA' },
            { trait: 'Year', value: '2000' },
          ],
        },
        partner,
      ),
    ];

    // TODO: https://github.com/FractionalDev/jump-marketplace-api/issues/215
    // assets[1].sellOrders = [
    //   await createSellOrder({
    //     assetId: assets[1].id,
    //     partnerId: partner.id,
    //     userId: user.id,
    //   }),
    // ];
  });

  afterEach(async () => {
    await Label.delete({});
    await Attribute.delete({});
    await Event.delete({});
    await Media.delete({});
    await SellOrder.delete({});
    await Asset.delete({});
    await Event.delete({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`GET V1 /assets`, () => {
    test('should empty list if second page is empty', () => {
      doAssetSearch('page=2', [], { totalItems: 3, totalPages: 1, currentPage: 2 });
    });

    test('should return 1 element', () => {
      doAssetSearch('limit=1', [assets[2]], { totalItems: 3, itemsPerPage: 1, totalPages: 3 });
    });

    test('should return 2 page', () => {
      doAssetSearch('page=2&limit=1', [assets[1]], {
        totalItems: 3,
        itemsPerPage: 1,
        totalPages: 3,
        currentPage: 2,
      });
    });

    test('should return 2 per page', () => {
      doAssetSearch('limit=2', [assets[2], assets[1]], {
        totalItems: 3,
        itemsPerPage: 2,
        totalPages: 2,
      });
    });

    test('should sort by name ASC', () => {
      doAssetSearch('sort=asset.name&order=ASC', [assets[0], assets[1], assets[2]]);
    });

    test('should sort by name DESC', () => {
      doAssetSearch('sort=asset.name&order=DESC', [assets[2], assets[1], assets[0]]);
    });

    test('should sort by slug ASC', () => {
      doAssetSearch('sort=asset.slug&order=ASC', [assets[0], assets[1], assets[2]]);
    });

    test('should sort by slug DESC', () => {
      doAssetSearch('sort=asset.slug&order=DESC', [assets[2], assets[1], assets[0]]);
    });

    test('should search by name', () => {
      doAssetSearch('query=pumpkin', [assets[1]]);
    });

    test('should search by name or description, return 1 record', async () => {
      doAssetSearch('search=pumpkin', [assets[1]]);
    });

    test('should search by name or description, return 2 records', async () => {
      doAssetSearch('search=egg', [assets[0]]);
    });

    // TODO https://github.com/FractionalDev/jump-marketplace-api/issues/217

    test('should filter by attribute, return 1 record', async () => {
      doAssetSearch('attr_eq[grading service]=PSA', [assets[2]]);
    });

    test('should filter by attribute, return 2 records', async () => {
      doAssetSearch('attr_eq[grading service]=BGS', [assets[1], assets[0]]);
    });

    test('should filter by attr_eq and attr_gte, return 2 records', async () => {
      doAssetSearch('attr_eq[category]=Baseball&attr_gte[year]=2014&attr_lte[year]=2030', [
        assets[1],
        assets[0],
      ]);
    });

    test('should filter by attr_eq and attr_gte, return 1 records', async () => {
      doAssetSearch('attr_eq[category]=baseball&attr_gte[year]=1999&attr_lte[year]=2001', [
        assets[2],
      ]);
    });

    test('should not found by attribute, return 0 records', async () => {
      doAssetSearch('attr_eq[category]=test', []);
    });

    test('should return empty list if attr_lte is different and not found records', async () => {
      doAssetSearch('attr_lte[year]=2018&attr_lte[cat]=2014', []);
    });

    test('should return empty list if attr_lte is different and not found records', async () => {
      doAssetSearch('attr_lte[year]=2018&attr_lte[cat]=2014', []);
    });

    test('should return list od assets for date range', async () => {
      doAssetSearch('attr_gte[year]=2014&attr_lte[year]=2019', [assets[1], assets[0]]);
    });

    test('should return list od assets for attr_gte', async () => {
      doAssetSearch('attr_gte[year]=2014', [assets[1], assets[0]]);
    });

    test('should return list od assets for attr_lte', async () => {
      doAssetSearch('attr_lte[year]=2014', [assets[2], assets[0]]);
    });

    test('should return asset for attr_lte and search', async () => {
      doAssetSearch('search=water&attr_lte[year]=2013', [assets[2]]);
    });

    test('should return 1 record of assets for attr_lte and search', async () => {
      doAssetSearch('search=egg&attr_lte[year]=2020', [assets[0]]);
    });

    test('should return 2 records of assets for attr_eq for different attributes', async () => {
      doAssetSearch('attr_eq[category]=baseball&attr_eq[grading service]=bgs', [
        assets[1],
        assets[0],
      ]);
    });

    test('a) should return asset for attr_gte and attr_lte range for different attributes', async () => {
      doAssetSearch('attr_gte[year]=2015&attr_lte[year]=2020&attr_gte[grade]=2&attr_lte[grade]=2', [
        assets[1],
      ]);
    });

    test('b) should return asset for attr_gte and attr_lte range for different attributes', async () => {
      doAssetSearch('attr_gte[year]=2014&attr_gte[grade]=8', [assets[0]]);
    });

    test('should return asset for attr_lte range for different attributes', async () => {
      doAssetSearch('attr_lte[year]=2020&attr_lte[grade]=10', [assets[2], assets[1], assets[0]]);
    });

    test('should return asset for attr_gte and search', async () => {
      doAssetSearch('search=pumpkin&attr_gte[year]=2015', [assets[1]]);
    });

    test('should return asset for attr_lte and attr_gte as number', async () => {
      doAssetSearch('attr_gte[grade]=5&attr_lte[grade]=10', [assets[2], assets[0]]);
    });

    test('should return asset for attr_lte and attr_gte as number and category', async () => {
      doAssetSearch('attr_eq[category]=baseball&attr_gte[grade]=5&attr_lte[grade]=10', [
        assets[2],
        assets[0],
      ]);
    });

    test('should return empty list if there is no results', () => {
      doAssetSearch('query=carrot', []);
    });

    test('should return empty list if name or description has not include searched a word', () => {
      doAssetSearch('search=carrot', []);
    });

    test('should return valid meta if asset has multiple attributes', async () => {
      doAssetSearch('', [assets[2], assets[1], assets[0]]);
    });

    test('should throw exception if attr_eq and attr_gte the same', async () => {
      const params = new URLSearchParams('attr_eq[year]=2018&attr_gte[year]=2014');
      const response = {
        error: 'Bad Request',
        message: 'ATTRIBUTE_DUPLICATED',
        statusCode: 400,
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 400, response);
    });

    test('should throw exception if attr_eq and attr_lte the same', async () => {
      const params = new URLSearchParams('attr_eq[year]=2018&attr_lte[year]=2014');
      const response = {
        error: 'Bad Request',
        message: 'ATTRIBUTE_DUPLICATED',
        statusCode: 400,
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 400, response);
    });

    test('should throw exception if attr_gte the same', async () => {
      const params = new URLSearchParams('attr_gte[year]=2018&attr_gte[year]=2014');
      const response = {
        error: 'Bad Request',
        message: 'ATTRIBUTE_DUPLICATED',
        statusCode: 400,
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 400, response);
    });

    test('should throw exception if attr_lte the same', async () => {
      const params = new URLSearchParams('attr_lte[year]=2018&attr_lte[year]=2014');
      const response = {
        error: 'Bad Request',
        message: 'ATTRIBUTE_DUPLICATED',
        statusCode: 400,
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 400, response);
    });

    test('should throw exception if attr_gte is greater than attr_lte', async () => {
      const params = new URLSearchParams('attr_gte[year]=2018&attr_lte[year]=2014');
      const response = {
        error: 'Bad Request',
        message: 'ATTRIBUTE_LTE_MUST_BE_GREATER_THAN_GTE',
        statusCode: 400,
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 400, response);
    });

    test('should throw an error if asset attr_lte is less than attr_gte', async () => {
      const params = new URLSearchParams('attr_gte[grade]=10&attr_lte[grade]=5');
      const response = {
        error: 'Bad Request',
        message: 'ATTRIBUTE_LTE_MUST_BE_GREATER_THAN_GTE',
        statusCode: 400,
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 400, response);
    });

    test('should 400 exception if params are invalid', () => {
      const params = new URLSearchParams({
        page: '-4',
        limit: '-10',
        sort: 'sausage',
        order: 'NULL',
      });
      const response = {
        error: 'Bad Request',
        message: [
          'sort must be a valid enum value',
          'page must not be less than 1',
          'limit must not be less than 0',
          'order must be a valid enum value',
        ],
        statusCode: 400,
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 400, response);
    });

    // TODO https://github.com/FractionalDev/jump-marketplace-api/issues/218
    // test('should exclude deleted media', async () => {
    //   const asset = await createAsset({ refId: '3', name: 'abc-1' }, partner);

    //   const toBeDeleted = await createImageMedia({ asset: asset, sortOrder: 1 });
    //   toBeDeleted.deletedAt = new Date();
    //   toBeDeleted.isDeleted = true;
    //   toBeDeleted.save();
    //   const activeMedia = [
    //     await createImageMedia({ asset: asset, sortOrder: 2 }),
    //     await createImageMedia({ asset: asset, sortOrder: 3 }),
    //   ];

    //   const assetWithMedia1 = await Asset.findOne(asset.id, { relations: ['media', 'partner'] });

    //   const response = {
    //     meta: {
    //       totalItems: 1,
    //       itemCount: 1,
    //       itemsPerPage: 25,
    //       totalPages: 1,
    //       currentPage: 1,
    //     },
    //     items: assetsTransformer.transformAll([
    //       Object.assign(assetWithMedia1, { media: mediaTransformer.transformAll(activeMedia) }),
    //     ]),
    //   };
    //   const params = new URLSearchParams({
    //     search: 'abc',
    //   });
    //   return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    // });
  });
});
