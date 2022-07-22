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
import { createAttribute } from '@/test/utils/attribute.utils';
import { Event } from 'modules/events/entities';
import { createImageMedia, createVideoMedia } from '../utils/media.utils';
import { MediaTransformer } from 'modules/assets/transformers/media.transformer';
import { createLabel } from '../utils/label.utils';
import { encodeHashId } from 'modules/common/helpers/hash-id.helper';
import * as testApp from '../utils/app.utils';
import { v4 } from 'uuid';
import { createAttributes, filterAttributes } from '../utils/test-helper';

describe('AssetsController', () => {
  let app: INestApplication;
  let assets: Asset[];
  let partner: Partner;
  let user: User;
  let assetsTransformer: AssetsTransformer;
  let mediaTransformer: MediaTransformer;

  beforeAll(async () => {
    app = await createApp();
    assetsTransformer = app.get(AssetsTransformer);
    mediaTransformer = app.get(MediaTransformer);
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
          partner,
        },
        partner,
      ),
      await createAsset(
        {
          refId: '2',
          name: 'Pumpkin',
          description: 'test-pumpkin',
        },
        partner,
      ),
    ];
  });

  afterEach(async () => {
    await Label.delete({});
    await Attribute.delete({});
    await Event.delete({});
    await Media.delete({});
    await Asset.delete({});
    await Event.delete({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`GET V1 /assets`, () => {
    test('should empty list if second page is empty', () => {
      const params = new URLSearchParams({
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
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should return 1 element', () => {
      const params = new URLSearchParams({
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
        items: [assetsTransformer.transform(assets[1])],
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should return 2 page', () => {
      const params = new URLSearchParams({
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
        items: [assetsTransformer.transform(assets[0])],
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should return 2 per page', () => {
      const params = new URLSearchParams({
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
        items: [assetsTransformer.transform(assets[1]), assetsTransformer.transform(assets[0])],
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should sort by name ASC', () => {
      const params = new URLSearchParams({
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
        items: [assetsTransformer.transform(assets[0]), assetsTransformer.transform(assets[1])],
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should sort by name DESC', () => {
      const params = new URLSearchParams({
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
        items: [assetsTransformer.transform(assets[1]), assetsTransformer.transform(assets[0])],
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should sort by slug ASC', () => {
      const params = new URLSearchParams({
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
        items: [assetsTransformer.transform(assets[0]), assetsTransformer.transform(assets[1])],
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should sort by slug DESC', () => {
      const params = new URLSearchParams({
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
        items: [assetsTransformer.transform(assets[1]), assetsTransformer.transform(assets[0])],
      };

      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should search by name', () => {
      const params = new URLSearchParams({
        query: 'pumpkin',
      });
      const response = {
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: [assetsTransformer.transform(assets[1])],
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should search by name or description, return 1 record', async () => {
      const params = new URLSearchParams({
        search: 'pumpkin',
      });
      const response = {
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: [assetsTransformer.transform(assets[1])],
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should search by name or description, return 2 records', async () => {
      assets = [
        await createAsset(
          {
            refId: '3',
            name: 'Pumpkin',
            description: 'test-orange',
          },
          partner,
        ),
        await createAsset(
          {
            refId: '4',
            name: 'Orange',
            description: 'test-orange',
          },
          partner,
        ),
      ];
      const params = new URLSearchParams({
        search: 'orange',
      });
      const response = {
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: [assetsTransformer.transform(assets[1]), assetsTransformer.transform(assets[0])],
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should search match first word of string by name or description , return 1 record', async () => {
      assets = [
        await createAsset(
          {
            refId: '3',
            name: 'Stephen Curry',
            description: 'test-stephen',
          },
          partner,
        ),
        await createAsset(
          {
            refId: '4',
            name: 'Orange',
            description: 'test-orange',
          },
          partner,
        ),
      ];
      const params = new URLSearchParams({
        search: 'steph',
      });
      const response = {
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: [assetsTransformer.transform(assets[0])],
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should search match second word of string by name or description , return 1 record', async () => {
      assets = [
        await createAsset(
          {
            refId: '3',
            name: 'Stephen Curry',
            description: 'test-stephen',
          },
          partner,
        ),
        await createAsset(
          {
            refId: '4',
            name: 'Orange',
            description: 'test-orange',
          },
          partner,
        ),
      ];
      const params = new URLSearchParams({
        search: 'cur',
      });
      const response = {
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: [assetsTransformer.transform(assets[0])],
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should search match multiple word of string by name or description , return 1 record', async () => {
      assets = [
        await createAsset(
          {
            refId: '3',
            name: '2009 Topps Chrome Refractor Stephen Curry ROOKIE /500 #101 PSA 10 GEM MINT',
            description: 'test-stephen',
          },
          partner,
        ),
        await createAsset(
          {
            refId: '4',
            name: 'Orange',
            description: 'test-orange',
          },
          partner,
        ),
      ];
      const params = new URLSearchParams({
        search: 'Topps Curry 2009',
      });
      const response = {
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: [assetsTransformer.transform(assets[0])],
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should search match multiple word with substring of string by name , return 1 record', async () => {
      assets = [
        await createAsset(
          {
            refId: '3',
            name: '2009 Topps Chrome Refractor Stephen Curry ROOKIE /500 #101 PSA 10 GEM MINT',
            description: 'test-stephen',
            partner,
          },
          partner,
        ),
        await createAsset(
          {
            refId: '4',
            name: 'Orange',
            description: 'test-orange',
          },
          partner,
        ),
      ];
      const params = new URLSearchParams({
        search: 'Topps Refract Curry',
      });

      const response = {
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: [assetsTransformer.transform(assets[0])],
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should search match multiple word with substring of string by description , return 1 record', async () => {
      assets = [
        await createAsset(
          {
            refId: '3',
            name: 'Stephen',
            description:
              '2009 Topps Chrome Refractor Stephen Curry ROOKIE /500 #101 PSA 10 GEM MINT',
          },
          partner,
        ),
        await createAsset(
          {
            refId: '4',
            name: 'Orange',
            description: 'test-orange',
          },
          partner,
        ),
      ];
      const params = new URLSearchParams({
        search: 'Topps Refract Curry',
      });
      const response = {
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: [assetsTransformer.transform(assets[0])],
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should search by name or description and partner hashed id, return 2 records', async () => {
      assets = [
        await createAsset(
          {
            refId: '3',
            name: 'Pumpkin',
            description: 'test-orange',
          },
          partner,
        ),
        await createAsset(
          {
            refId: '4',
            name: 'Orange',
            description: 'test-orange',
          },
          partner,
        ),
      ];
      const params = new URLSearchParams({
        search: 'orange',
        partner: encodeHashId(partner.id, process.env.HASHID_SALT),
      });
      const response = {
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: [assetsTransformer.transform(assets[1]), assetsTransformer.transform(assets[0])],
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should filter by attribute, return 1 record', async () => {
      assets = [
        await createAsset(
          {
            refId: '3',
            name: 'Orange',
            description: 'test-orange',
          },
          partner,
        ),
      ];
      const attributes = [
        await createAttribute({
          trait: 'category',
          value: 'test',
          assetId: assets[0].id,
        }),
      ];
      const params = new URLSearchParams({
        'attr_eq[category]': 'test',
      });
      const result = Object.assign(assets[0], { attributes });
      const response = {
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: [assetsTransformer.transform(result)],
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should filter by attribute, return 2 records', async () => {
      assets = [
        await createAsset(
          {
            refId: '3',
            name: 'Orange 1',
            description: 'test-orange',
          },
          partner,
        ),
        await createAsset(
          {
            refId: '4',
            name: 'Orange 2',
            description: 'test-orange',
          },
          partner,
        ),
      ];
      const attributes = await createAttributes([
        {
          trait: 'category',
          value: 'test',
          assetId: assets[0].id,
        },
        {
          trait: 'category',
          value: 'test',
          assetId: assets[1].id,
        },
      ]);

      const params = new URLSearchParams({
        'attr_eq[category]': 'test',
      });
      const result = [
        Object.assign(assets[1], { attributes: [attributes[1]] }),
        Object.assign(assets[0], { attributes: [attributes[0]] }),
      ];
      const response = {
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should filter by attribute and label, return 1 record', async () => {
      assets = [
        await createAsset(
          {
            refId: '3',
            name: 'Orange 1',
            description: 'test-orange',
          },
          partner,
        ),
        await createAsset(
          {
            refId: '4',
            name: 'Orange 2',
            description: 'test-orange',
          },
          partner,
        ),
      ];
      const attributes = await createAttributes([
        { trait: 'category', value: 'test', assetId: assets[0].id },
        { trait: 'category', value: 'test', assetId: assets[1].id },
      ]);

      const labels = [await createLabel({ name: 'feature', value: 'true', assetId: assets[0].id })];
      const params = new URLSearchParams({
        'attr_eq[category]': 'test',
        'label_eq[feature]': 'true',
      });
      const result = [
        Object.assign(assets[0], { attributes: [attributes[0]], labels: [labels[0]] }),
      ];
      const response = {
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should filter by attr_eq and attr_gte, return 2 records', async () => {
      assets = [
        await createAsset(
          {
            refId: '3',
            name: 'Orange 1',
            description: 'test-orange',
          },
          partner,
        ),
        await createAsset(
          {
            refId: '4',
            name: 'Orange 2',
            description: 'test-orange',
          },
          partner,
        ),
      ];
      const attributes = await createAttributes([
        { trait: 'category', value: 'test', assetId: assets[0].id },
        { trait: 'year', value: '2019', assetId: assets[0].id },
        { trait: 'category', value: 'test', assetId: assets[1].id },
        { trait: 'year', value: '2019', assetId: assets[1].id },
      ]);

      const params = new URLSearchParams({
        'attr_eq[category]': 'test',
        'attr_gte[year]': '2019',
        'attr_lte[year]': '2030',
      });
      const result = [
        Object.assign(assets[1], {
          attributes: filterAttributes(attributes, assets[1].id),
        }),
        Object.assign(assets[0], { attributes: filterAttributes(attributes, assets[0].id) }),
      ];

      const response = {
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should filter by attr_eq and attr_gte, return 1 records', async () => {
      assets = [
        await createAsset(
          {
            refId: '3',
            name: 'Orange 1',
            description: 'test-orange',
          },
          partner,
        ),
        await createAsset(
          {
            refId: '4',
            name: 'Orange 2',
            description: 'test-orange',
          },
          partner,
        ),
      ];
      const attributes = await createAttributes([
        { trait: 'category', value: 'another', assetId: assets[0].id },
        { trait: 'category', value: 'test', assetId: assets[1].id },
        { trait: 'year', value: '2020', assetId: assets[1].id },
      ]);

      const params = new URLSearchParams({
        'attr_eq[category]': 'test',
        'attr_gte[year]': '2020',
        'attr_lte[year]': '2030',
      });
      const result = [
        Object.assign(assets[1], {
          attributes: filterAttributes(attributes, assets[1].id),
        }),
      ];
      const response = {
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should not found by attribute, return 0 records', async () => {
      const params = new URLSearchParams({
        'attr_eq[category]': 'test',
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
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should not found by label, return 0 records', async () => {
      const params = new URLSearchParams({
        'label_eq[feature]': 'true',
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
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should not found by attribute and label, return 0 records', async () => {
      const params = new URLSearchParams({
        'attr_eq[category]': 'test',
        'label_eq[feature]': 'true',
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
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
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

    test('should return empty list if attr_lte is different and not found records', async () => {
      const params = new URLSearchParams('attr_lte[year]=2018&attr_lte[cat]=2014');
      const response = {
        items: [],
        meta: {
          currentPage: 1,
          itemCount: 0,
          itemsPerPage: 25,
          totalItems: 0,
          totalPages: 0,
        },
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
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

    test('should return empty list if attr_lte is different and not found records', async () => {
      const params = new URLSearchParams('attr_lte[year]=2018&attr_lte[cat]=2014');
      const response = {
        items: [],
        meta: {
          currentPage: 1,
          itemCount: 0,
          itemsPerPage: 25,
          totalItems: 0,
          totalPages: 0,
        },
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
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

    test('should return list if attr_lte is greater than attr_gte', async () => {
      const attributes = [
        await createAttribute({
          trait: 'year',
          value: '2014',
          assetId: assets[0].id,
        }),
      ];
      const params = new URLSearchParams('attr_gte[year]=2014&attr_lte[year]=2018');
      const result = [Object.assign(assets[0], { attributes: [attributes[0]] })];
      const response = {
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should return list od assets for date range', async () => {
      const asset2 = await createAsset(
        {
          refId: '4',
          name: 'Water',
          description: 'test-water',
        },
        partner,
      );

      const attributes = await createAttributes([
        { trait: 'year', value: '2014', assetId: assets[0].id },
        { trait: 'year', value: '2019', assetId: assets[1].id },
        { trait: 'year', value: '2000', assetId: asset2.id },
      ]);

      const params = new URLSearchParams('attr_gte[year]=2014&attr_lte[year]=2019');
      const result = [
        Object.assign(assets[1], { attributes: [attributes[1]] }),
        Object.assign(assets[0], { attributes: [attributes[0]] }),
      ];
      const response = {
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should return list od assets for attr_gte', async () => {
      const asset2 = await createAsset(
        {
          refId: '5',
          name: 'Water',
          description: 'test-water',
        },
        partner,
      );

      const attributes = await createAttributes([
        { trait: 'year', value: '2014', assetId: assets[0].id },
        { trait: 'year', value: '2019', assetId: assets[1].id },
        { trait: 'year', value: '2000', assetId: asset2.id },
      ]);
      const params = new URLSearchParams('attr_gte[year]=2014');
      const result = [
        Object.assign(assets[1], {
          attributes: filterAttributes(attributes, assets[1].id),
        }),
        Object.assign(assets[0], {
          attributes: filterAttributes(attributes, assets[0].id),
        }),
      ];
      const response = {
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should return list od assets for attr_lte', async () => {
      const asset2 = await createAsset(
        {
          refId: '6',
          name: 'Water',
          description: 'test-water',
        },
        partner,
      );
      const attributes = await createAttributes([
        { trait: 'year', value: '2014', assetId: assets[0].id },
        { trait: 'year', value: '2019', assetId: assets[1].id },
        { trait: 'year', value: '2000', assetId: asset2.id },
      ]);

      const params = new URLSearchParams('attr_lte[year]=2014');
      const result = [
        Object.assign(asset2, {
          attributes: filterAttributes(attributes, asset2.id),
        }),
        Object.assign(assets[0], { attributes: filterAttributes(attributes, assets[0].id) }),
      ];
      const response = {
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should return asset for attr_lte and search', async () => {
      const asset2 = await createAsset(
        {
          refId: '7',
          name: 'Egg',
          description: 'test-egg',
        },
        partner,
      );
      const attributes = await createAttributes([
        { trait: 'year', value: '2014', assetId: assets[0].id },
        { trait: 'year', value: '2019', assetId: assets[1].id },
        { trait: 'year', value: '2000', assetId: asset2.id },
      ]);

      const params = new URLSearchParams('search=egg&attr_lte[year]=2013');
      const result = [
        Object.assign(asset2, { attributes: filterAttributes(attributes, asset2.id) }),
      ];
      const response = {
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should return 2 records of assets for attr_lte and search', async () => {
      const assets = [
        await createAsset(
          {
            refId: '100',
            name: 'ABC',
            description: 'test-abc',
          },
          partner,
        ),
        await createAsset(
          {
            refId: '101',
            name: 'Sun',
            description: 'test-sun',
          },
          partner,
        ),
        await createAsset(
          {
            refId: '102',
            name: 'ABC',
            description: 'test-abc',
          },
          partner,
        ),
      ];
      const attributes = await createAttributes([
        { trait: 'year', value: '2014', assetId: assets[0].id },
        { trait: 'year', value: '2019', assetId: assets[1].id },
        { trait: 'year', value: '2000', assetId: assets[2].id },
      ]);

      const params = new URLSearchParams('search=abc&attr_lte[year]=2020');
      const result = [
        Object.assign(assets[2], { attributes: filterAttributes(attributes, assets[2].id) }),
        Object.assign(assets[0], { attributes: filterAttributes(attributes, assets[0].id) }),
      ];
      const response = {
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should return 2 records of assets for attr_eq for different attributes', async () => {
      const assets = [
        await createAsset(
          {
            refId: '103',
            name: 'ABC',
            description: 'test-abc',
          },
          partner,
        ),
        await createAsset(
          {
            refId: '104',
            name: 'Sun',
            description: 'test-sun',
          },
          partner,
        ),
        await createAsset(
          {
            refId: '105',
            name: 'ABC',
            description: 'test-abc',
          },
          partner,
        ),
      ];

      const attributes = await createAttributes([
        { trait: 'Category', value: 'Baseball', assetId: assets[0].id },
        { trait: 'Grading Service', value: 'BGS', assetId: assets[0].id },
        { trait: 'Category', value: 'Baseball', assetId: assets[1].id },
        { trait: 'Grading Service', value: 'BGS', assetId: assets[1].id },
        { trait: 'Category', value: 'Baseball', assetId: assets[2].id },
      ]);

      const params = new URLSearchParams('attr_eq[Category]=Baseball&attr_eq[Grading Service]=BGS');
      const result = [
        Object.assign(assets[1], { attributes: filterAttributes(attributes, assets[1].id) }),
        Object.assign(assets[0], { attributes: filterAttributes(attributes, assets[0].id) }),
      ];
      const response = {
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should return 2 records of assets for label_eq for different labels', async () => {
      const assets = [
        await createAsset(
          {
            refId: '106',
            name: 'ABC',
            description: 'test-abc',
          },
          partner,
        ),
        await createAsset(
          {
            refId: '107',
            name: 'Sun',
            description: 'test-sun',
          },
          partner,
        ),
        await createAsset(
          {
            refId: '108',
            name: 'ABC',
            description: 'test-abc',
          },
          partner,
        ),
      ];

      const labels = [
        await createLabel({
          name: 'Feature',
          value: 'true',
          assetId: assets[0].id,
        }),
        await createLabel({
          name: 'Sold',
          value: 'false',
          assetId: assets[0].id,
        }),
        await createLabel({
          name: 'Sold',
          value: 'true',
          assetId: assets[1].id,
        }),
      ];

      const params = new URLSearchParams('label_eq[Feature]=true&label_eq[Sold]=false');
      const result = [Object.assign(assets[0], { labels: [labels[0], labels[1]] })];
      const response = {
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should return asset for attr_gte and attr_lte range for different attributes', async () => {
      const attributes = await createAttributes([
        { trait: 'grade', value: '20', assetId: assets[1].id },
        { trait: 'year', value: '2014', assetId: assets[0].id },
        { trait: 'year', value: '2019', assetId: assets[1].id },
      ]);

      const params = new URLSearchParams(
        'attr_gte[year]=2015&attr_lte[year]=2020&attr_gte[grade]=20&attr_lte[grade]=30',
      );
      const result = [
        Object.assign(assets[1], {
          attributes: filterAttributes(attributes, assets[1].id),
        }),
      ];
      const response = {
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should return asset for attr_gte and attr_lte range for different attributes', async () => {
      const attributes = await createAttributes([
        { trait: 'grade', value: '20', assetId: assets[1].id },
        { trait: 'year', value: '2014', assetId: assets[0].id },
        { trait: 'year', value: '2019', assetId: assets[1].id },
      ]);

      const params = new URLSearchParams('attr_gte[year]=2015&attr_gte[grade]=20');
      const result = [
        Object.assign(assets[1], { attributes: filterAttributes(attributes, assets[1].id) }),
      ];
      const response = {
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should return asset for attr_lte range for different attributes', async () => {
      const attributes = await createAttributes([
        { trait: 'grade', value: '20', assetId: assets[0].id },
        { trait: 'year', value: '2014', assetId: assets[0].id },
        { trait: 'year', value: '2021', assetId: assets[1].id },
      ]);

      const params = new URLSearchParams('attr_lte[year]=2020&attr_lte[grade]=30');
      const result = [
        Object.assign(assets[0], { attributes: filterAttributes(attributes, assets[0].id) }),
      ];
      const response = {
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should return asset for attr_gte and search', async () => {
      const asset2 = await createAsset(
        {
          refId: '8',
          name: 'Sun',
          description: 'test-sun',
        },
        partner,
      );
      const attributes = await createAttributes([
        { trait: 'year', value: '2014', assetId: assets[0].id },
        { trait: 'year', value: '2019', assetId: assets[1].id },
        { trait: 'year', value: '2020', assetId: asset2.id },
      ]);

      const params = new URLSearchParams('search=sun&attr_gte[year]=2015');
      const result = [
        Object.assign(asset2, { attributes: filterAttributes(attributes, asset2.id) }),
      ];
      const response = {
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should return asset for attr_lte and attr_gte as number', async () => {
      const asset2 = await createAsset(
        {
          refId: '9',
          name: 'Ice',
          description: 'test-egg',
        },
        partner,
      );
      const attributes = await createAttributes([
        { trait: 'grade', value: '1', assetId: assets[0].id },
        { trait: 'grade', value: '10', assetId: assets[1].id },
        { trait: 'grade', value: '5', assetId: asset2.id },
      ]);

      const params = new URLSearchParams('attr_gte[grade]=5&attr_lte[grade]=10');
      const result = [
        Object.assign(asset2, { attributes: filterAttributes(attributes, asset2.id) }),
        Object.assign(assets[1], { attributes: filterAttributes(attributes, assets[1].id) }),
      ];
      const response = {
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should return asset for attr_lte and attr_gte as number and category', async () => {
      const asset2 = await createAsset(
        {
          refId: '20',
          name: 'Ice',
          description: 'test-egg',
        },
        partner,
      );
      const attributes = await createAttributes([
        { trait: 'category', value: 'baseball', assetId: asset2.id },
        { trait: 'category', value: 'baseball', assetId: assets[1].id },
        { trait: 'grade', value: '1', assetId: assets[0].id },
        { trait: 'grade', value: '10', assetId: assets[1].id },
        { trait: 'grade', value: '5', assetId: asset2.id },
      ]);

      const params = new URLSearchParams(
        'attr_eq[category]=baseball&attr_gte[grade]=5&attr_lte[grade]=10',
      );
      const result = [
        Object.assign(asset2, {
          attributes: filterAttributes(attributes, asset2.id),
        }),
        Object.assign(assets[1], {
          attributes: filterAttributes(attributes, assets[1].id),
        }),
      ];
      const response = {
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll(result),
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
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

    test('should return empty list if there is no results', () => {
      const params = new URLSearchParams({
        query: 'carrot',
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
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should throw a 400 status if there is no results for the wrong format partner hash id ', () => {
      const params = new URLSearchParams({
        partner: encodeHashId('wrong-hash', process.env.HASHID_SALT),
      });
      const response = {
        error: 'Bad Request',
        message: ['partner should not be empty'],
        statusCode: 400,
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 400, response);
    });

    test('should throw a 400 status if there is no results for the partner hash id not uuid after decode', () => {
      const params = new URLSearchParams({
        partner: encodeHashId('wronghash', process.env.HASHID_SALT),
      });
      const response = {
        error: 'Bad Request',
        message: ['partner should not be empty'],
        statusCode: 400,
      };
      return testApp.get(app, `/v1/assets?${params.toString()}`, 400, response);
    });

    test('should return empty list if there is no results for partner hash id', () => {
      const params = new URLSearchParams({
        partner: encodeHashId(v4(), process.env.HASHID_SALT),
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
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });

    test('should return empty list if name or description has not include searched a word', () => {
      const params = new URLSearchParams({
        search: 'carrot',
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
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
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

    test('should return valid meta if asset has multiple attributes', async () => {
      const asset1 = await createAsset({ refId: '3', name: 'abc-1' }, partner);
      const asset2 = await createAsset({ refId: '4', name: 'abc-2' }, partner);
      const asset3 = await createAsset({ refId: '5', name: 'abc-3' }, partner);

      await createAttributes([
        { asset: asset1 },
        { asset: asset1 },
        { asset: asset1 },
        { asset: asset2 },
      ]);

      const assetWithAttributes1 = await Asset.findOne(asset1.id, {
        relations: ['attributes', 'partner'],
      });
      const assetWithAttributes2 = await Asset.findOne(asset2.id, {
        relations: ['attributes', 'partner'],
      });
      const assetWithAttributes3 = await Asset.findOne(asset3.id, {
        relations: ['attributes', 'partner'],
      });
      const response = {
        meta: {
          totalItems: 3,
          itemCount: 3,
          itemsPerPage: 25,
          totalPages: 1,
          currentPage: 1,
        },
        items: assetsTransformer.transformAll([
          assetWithAttributes3,
          assetWithAttributes2,
          assetWithAttributes1,
        ]),
      };
      const params = new URLSearchParams({
        search: 'abc',
      });
      return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
    });
  });
  test('should return valid meta if asset has media', async () => {
    const asset1 = await createAsset({ refId: '3', name: 'abc-1' }, partner);
    const asset2 = await createAsset({ refId: '4', name: 'abc-2' }, partner);
    const asset3 = await createAsset({ refId: '5', name: 'abc-3' }, partner);

    const imageMedia = await createImageMedia({ asset: asset1, sortOrder: 1 });
    await createImageMedia({ asset: asset1, sortOrder: 2 });
    await createImageMedia({ asset: asset1, sortOrder: 3 });
    const videoMedia = await createVideoMedia({ asset: asset2, sortOrder: 1 });

    const assetWithMedia1 = await Asset.findOne(asset1.id, { relations: ['media', 'partner'] });
    const assetWithMedia2 = await Asset.findOne(asset2.id, { relations: ['media', 'partner'] });
    const assetWithMedia3 = await Asset.findOne(asset3.id, { relations: ['media', 'partner'] });

    const response = {
      meta: {
        totalItems: 3,
        itemCount: 3,
        itemsPerPage: 25,
        totalPages: 1,
        currentPage: 1,
      },
      items: assetsTransformer.transformAll([
        Object.assign(assetWithMedia3, {
          media: mediaTransformer.transformAll(assetWithMedia3.media),
        }),
        Object.assign(assetWithMedia2, { media: mediaTransformer.transformAll([videoMedia]) }),
        Object.assign(assetWithMedia1, { media: mediaTransformer.transformAll([imageMedia]) }),
      ]),
    };
    const params = new URLSearchParams({
      search: 'abc',
    });
    return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
  });

  test('should exclude deleted media', async () => {
    const asset = await createAsset({ refId: '3', name: 'abc-1' }, partner);

    const toBeDeleted = await createImageMedia({ asset: asset, sortOrder: 1 });
    toBeDeleted.deletedAt = new Date();
    toBeDeleted.isDeleted = true;
    toBeDeleted.save();
    const imageMedia = await createImageMedia({ asset: asset, sortOrder: 2 });

    await createImageMedia({ asset: asset, sortOrder: 3 });

    const assetWithMedia1 = await Asset.findOne(asset.id, { relations: ['media', 'partner'] });

    const response = {
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 25,
        totalPages: 1,
        currentPage: 1,
      },
      items: assetsTransformer.transformAll([
        Object.assign(assetWithMedia1, { media: mediaTransformer.transformAll([imageMedia]) }),
      ]),
    };
    const params = new URLSearchParams({
      search: 'abc',
    });
    return testApp.get(app, `/v1/assets?${params.toString()}`, 200, response);
  });
});
