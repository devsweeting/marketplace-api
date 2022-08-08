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
import { SellOrder } from 'modules/sell-orders/entities';
import { createSellOrder } from '../utils/sell-order.utils';
import { SellOrdersTransformer } from 'modules/sell-orders/transformers/sell-orders.transformer';

describe('SellOrdersController', () => {
  let app: INestApplication;
  let partner: Partner;
  let anotherPartner: Partner;
  let users: User[];
  let assets: Asset[];
  let sellOrders: SellOrder[];
  let sellOrdersTransformer: SellOrdersTransformer;
  let header;
  const BASE_URL = `/v1/sellorders`;

  beforeAll(async () => {
    app = await createApp();
    sellOrdersTransformer = app.get(SellOrdersTransformer);
    users = [
      await createUser({ email: 'partner@test.com', role: RoleEnum.USER }),
      await createUser({ email: 'user@test.com', role: RoleEnum.USER }),
      await createUser({ email: 'user1@test.com', role: RoleEnum.USER }),
    ];
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: users[0],
    });
    anotherPartner = await createPartner({
      apiKey: 'test-api-key-another',
      accountOwner: users[1],
    });
    assets = [
      await createAsset(
        {
          refId: '1',
          name: 'Egg',
          description: 'test-egg',
        },
        partner,
      ),
      await createAsset(
        {
          refId: '2',
          name: 'Water',
          description: 'test-water',
        },
        partner,
      ),
      await createAsset(
        {
          refId: '3',
          name: 'Sun',
          description: 'test-sun',
        },
        anotherPartner,
      ),
    ];
    sellOrders = [
      await createSellOrder({
        assetId: assets[0].id,
        partnerId: partner.id,
        userId: users[1].id,
      }),
      await createSellOrder({
        assetId: assets[1].id,
        partnerId: partner.id,
        userId: users[1].id,
      }),
      await createSellOrder({
        assetId: assets[2].id,
        partnerId: anotherPartner.id,
        userId: users[2].id,
      }),
    ];
    header = {
      'x-api-key': partner.apiKey,
    };
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`GET V1 /sellorders`, () => {
    test('should empty list if second page is empty', () => {
      const params = new URLSearchParams({
        partnerId: partner.id,
        page: '2',
      });
      const response = {
        meta: {
          totalItems: 2,
          itemCount: 0,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 2,
        },
        items: [],
      };
      return testApp.get(app, BASE_URL + `?${params.toString()}`, 200, response, {}, header);
    });

    test('should return 1 element', () => {
      const params = new URLSearchParams({
        partnerId: partner.id,
        limit: '1',
      });
      const response = {
        meta: {
          totalItems: 2,
          itemCount: 1,
          itemsPerPage: 1,
          totalPages: 2,
          currentPage: 1,
        },
        items: [sellOrdersTransformer.transform(sellOrders[1])],
      };
      return testApp.get(app, BASE_URL + `?${params.toString()}`, 200, response, {}, header);
    });

    test('should return 2 page', () => {
      const params = new URLSearchParams({
        partnerId: partner.id,
        limit: '1',
        page: '2',
      });

      const response = {
        meta: {
          totalItems: 2,
          itemCount: 1,
          itemsPerPage: 1,
          totalPages: 2,
          currentPage: 2,
        },
        items: [sellOrdersTransformer.transform(sellOrders[0])],
      };

      return testApp.get(app, BASE_URL + `?${params.toString()}`, 200, response, {}, header);
    });

    test('should return 2 per page', () => {
      const params = new URLSearchParams({
        partnerId: partner.id,
        limit: '2',
      });
      const response = {
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 2,
          totalPages: 1,
          currentPage: 1,
        },
        items: [
          sellOrdersTransformer.transform(sellOrders[1]),
          sellOrdersTransformer.transform(sellOrders[0]),
        ],
      };
      return testApp.get(app, BASE_URL + `?${params.toString()}`, 200, response, {}, header);
    });
  });
  test('should sort by name ASC', () => {
    const params = new URLSearchParams({
      partnerId: partner.id,
      sort: 'asset.name',
      order: 'ASC',
    });
    const response = {
      meta: {
        totalItems: 2,
        itemCount: 2,
        itemsPerPage: 25,
        totalPages: 1,
        currentPage: 1,
      },
      items: [
        sellOrdersTransformer.transform(sellOrders[0]),
        sellOrdersTransformer.transform(sellOrders[1]),
      ],
    };
    return testApp.get(app, BASE_URL + `?${params.toString()}`, 200, response, {}, header);
  });

  test('should sort by name DESC', () => {
    const params = new URLSearchParams({
      partnerId: partner.id,
      sort: 'asset.name',
      order: 'DESC',
    });
    const response = {
      meta: {
        totalItems: 2,
        itemCount: 2,
        itemsPerPage: 25,
        totalPages: 1,
        currentPage: 1,
      },
      items: [
        sellOrdersTransformer.transform(sellOrders[1]),
        sellOrdersTransformer.transform(sellOrders[0]),
      ],
    };

    return testApp.get(app, BASE_URL + `?${params.toString()}`, 200, response, {}, header);
  });
  test('should sort by slug ASC', () => {
    const params = new URLSearchParams({
      partnerId: partner.id,
      sort: 'asset.slug',
      order: 'ASC',
    });
    const response = {
      meta: {
        totalItems: 2,
        itemCount: 2,
        itemsPerPage: 25,
        totalPages: 1,
        currentPage: 1,
      },
      items: [
        sellOrdersTransformer.transform(sellOrders[0]),
        sellOrdersTransformer.transform(sellOrders[1]),
      ],
    };
    return testApp.get(app, BASE_URL + `?${params.toString()}`, 200, response, {}, header);
  });

  test('should sort by slug DESC', () => {
    const params = new URLSearchParams({
      partnerId: partner.id,
      sort: 'asset.slug',
      order: 'DESC',
    });
    const response = {
      meta: {
        totalItems: 2,
        itemCount: 2,
        itemsPerPage: 25,
        totalPages: 1,
        currentPage: 1,
      },
      items: [
        sellOrdersTransformer.transform(sellOrders[1]),
        sellOrdersTransformer.transform(sellOrders[0]),
      ],
    };

    return testApp.get(app, BASE_URL + `?${params.toString()}`, 200, response, {}, header);
  });

  test('should return empty list if there are no results for assetId filter', () => {
    const params = new URLSearchParams({
      partnerId: partner.id,
      assetId: assets[2].id,
    });
    const response = {
      meta: {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 25,
        totalPages: 0,
        currentPage: 1,
      },
      items: [],
    };
    return testApp.get(app, BASE_URL + `?${params.toString()}`, 200, response, {}, header);
  });

  test('should return list if there are results for assetId filter', () => {
    const params = new URLSearchParams({
      partnerId: partner.id,
      assetId: assets[0].id,
    });
    const response = {
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 25,
        totalPages: 1,
        currentPage: 1,
      },
      items: [sellOrdersTransformer.transform(sellOrders[0])],
    };
    return testApp.get(app, BASE_URL + `?${params.toString()}`, 200, response, {}, header);
  });

  test('should return empty list if there are no results for slug filter', () => {
    const params = new URLSearchParams({
      partnerId: partner.id,
      slug: assets[2].slug,
    });
    const response = {
      meta: {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 25,
        totalPages: 0,
        currentPage: 1,
      },
      items: [],
    };
    return testApp.get(app, BASE_URL + `?${params.toString()}`, 200, response, {}, header);
  });

  test('should return list if there are results for slug filter', () => {
    const params = new URLSearchParams({
      partnerId: partner.id,
      slug: assets[0].slug,
    });
    const response = {
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 25,
        totalPages: 1,
        currentPage: 1,
      },
      items: [sellOrdersTransformer.transform(sellOrders[0])],
    };
    return testApp.get(app, BASE_URL + `?${params.toString()}`, 200, response, {}, header);
  });

  test('should return only anotherPartner`s sell orders', () => {
    const params = new URLSearchParams({
      partnerId: anotherPartner.id,
    });
    const response = {
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 25,
        totalPages: 1,
        currentPage: 1,
      },
      items: [sellOrdersTransformer.transform(sellOrders[2])],
    };
    return testApp.get(app, BASE_URL + `?${params.toString()}`, 200, response, {}, header);
  });
});
