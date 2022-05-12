import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp, mockS3Provider } from '@/test/utils/app.utils';
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

describe('AssetsController', () => {
  let app: INestApplication;
  let assets: Asset[];
  let partner: Partner;
  let user: User;
  let assetsTransformer: AssetsTransformer;
  let mediaTransformer: MediaTransformer;
  const mockedFileUrl = 'http://example.com';

  beforeAll(async () => {
    app = await createApp();
    assetsTransformer = app.get(AssetsTransformer);
    mediaTransformer = app.get(MediaTransformer);
    user = await createUser({ email: 'partner@test.com', role: RoleEnum.USER });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
    assets = [
      await createAsset({
        refId: '1',
        name: 'Egg',
        description: 'test-egg',
        partner,
      }),
      await createAsset({
        refId: '2',
        name: 'Pumpkin',
        description: 'test-pumpkin',
        partner,
      }),
    ];
    mockS3Provider.getUrl.mockReturnValue(mockedFileUrl);
  });

  afterEach(async () => {
    await Attribute.delete({});
    await Label.delete({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`GET V1 /assets`, () => {
    it('should return 1 element', () => {
      const params = new URLSearchParams({
        limit: '1',
      });

      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 1,
              itemsPerPage: 1,
              totalPages: 2,
              currentPage: 1,
            },
            items: [assetsTransformer.transform(assets[1])],
          });
        });
    });

    it('should return 2 page', () => {
      const params = new URLSearchParams({
        limit: '1',
        page: '2',
      });

      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 1,
              itemsPerPage: 1,
              totalPages: 2,
              currentPage: 2,
            },
            items: [assetsTransformer.transform(assets[0])],
          });
        });
    });

    it('should return 2 per page', () => {
      const params = new URLSearchParams({
        limit: '2',
      });

      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 2,
              totalPages: 1,
              currentPage: 1,
            },
            items: [assetsTransformer.transform(assets[1]), assetsTransformer.transform(assets[0])],
          });
        });
    });

    it('should sort by name ASC', () => {
      const params = new URLSearchParams({
        sort: 'asset.name',
        order: 'ASC',
      });

      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: [assetsTransformer.transform(assets[0]), assetsTransformer.transform(assets[1])],
          });
        });
    });

    it('should sort by name DESC', () => {
      const params = new URLSearchParams({
        sort: 'asset.name',
        order: 'DESC',
      });

      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: [assetsTransformer.transform(assets[1]), assetsTransformer.transform(assets[0])],
          });
        });
    });

    it('should sort by slug ASC', () => {
      const params = new URLSearchParams({
        sort: 'asset.slug',
        order: 'ASC',
      });

      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: [assetsTransformer.transform(assets[0]), assetsTransformer.transform(assets[1])],
          });
        });
    });

    it('should sort by slug DESC', () => {
      const params = new URLSearchParams({
        sort: 'asset.slug',
        order: 'DESC',
      });

      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: [assetsTransformer.transform(assets[1]), assetsTransformer.transform(assets[0])],
          });
        });
    });

    it('should search by name', () => {
      const params = new URLSearchParams({
        query: 'pumpkin',
      });

      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 1,
              itemCount: 1,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: [assetsTransformer.transform(assets[1])],
          });
        });
    });

    it('should search by name or description, return 1 record', async () => {
      await Event.delete({});
      await Asset.delete({});
      assets = [
        await createAsset({
          refId: '1',
          name: 'Pumpkin',
          description: 'test-orange',
          partner,
        }),
        await createAsset({
          refId: '2',
          name: 'Orange',
          description: 'test-orange',
          partner,
        }),
      ];
      const params = new URLSearchParams({
        search: 'pumpkin',
      });

      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 1,
              itemCount: 1,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: [assetsTransformer.transform(assets[0])],
          });
        });
    });

    it('should search by name or description, return 2 records', async () => {
      await Event.delete({});
      await Asset.delete({});
      assets = [
        await createAsset({
          refId: '1',
          name: 'Pumpkin',
          description: 'test-orange',
          partner,
        }),
        await createAsset({
          refId: '2',
          name: 'Orange',
          description: 'test-orange',
          partner,
        }),
      ];
      const params = new URLSearchParams({
        search: 'orange',
      });

      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: [assetsTransformer.transform(assets[1]), assetsTransformer.transform(assets[0])],
          });
        });
    });

    it('should filter by attribute, return 1 record', async () => {
      await Event.delete({});
      await Asset.delete({});

      assets = [
        await createAsset({
          refId: '2',
          name: 'Orange',
          description: 'test-orange',
          partner,
        }),
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
      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 1,
              itemCount: 1,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: [assetsTransformer.transform(result)],
          });
        });
    });

    it('should filter by attribute, return 2 records', async () => {
      await Event.delete({});
      await Asset.delete({});
      assets = [
        await createAsset({
          refId: '1',
          name: 'Orange 1',
          description: 'test-orange',
          partner,
        }),
        await createAsset({
          refId: '2',
          name: 'Orange 2',
          description: 'test-orange',
          partner,
        }),
      ];
      const attributes = [
        await createAttribute({
          trait: 'category',
          value: 'test',
          assetId: assets[0].id,
        }),
        await createAttribute({
          trait: 'category',
          value: 'test',
          assetId: assets[1].id,
        }),
      ];
      const params = new URLSearchParams({
        'attr_eq[category]': 'test',
      });
      const result = [
        Object.assign(assets[1], { attributes: [attributes[1]] }),
        Object.assign(assets[0], { attributes: [attributes[0]] }),
      ];
      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: assetsTransformer.transformAll(result),
          });
        });
    });

    it('should filter by attribute and label, return 1 record', async () => {
      await Event.delete({});
      await Asset.delete({});
      assets = [
        await createAsset({
          refId: '1',
          name: 'Orange 1',
          description: 'test-orange',
          partner,
        }),
        await createAsset({
          refId: '2',
          name: 'Orange 2',
          description: 'test-orange',
          partner,
        }),
      ];
      const attributes = [
        await createAttribute({
          trait: 'category',
          value: 'test',
          assetId: assets[0].id,
        }),
        await createAttribute({
          trait: 'category',
          value: 'test',
          assetId: assets[1].id,
        }),
      ];
      const labels = [await createLabel({ name: 'feature', value: 'true', assetId: assets[0].id })];
      const params = new URLSearchParams({
        'attr_eq[category]': 'test',
        'label_eq[feature]': 'true',
      });
      const result = [
        Object.assign(assets[0], { attributes: [attributes[0]], labels: [labels[0]] }),
      ];
      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 1,
              itemCount: 1,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: assetsTransformer.transformAll(result),
          });
        });
    });

    it('should not found by attribute, return 0 records', async () => {
      const params = new URLSearchParams({
        'attr_eq[category]': 'test',
      });

      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 0,
              itemCount: 0,
              itemsPerPage: 25,
              totalPages: 0,
              currentPage: 1,
            },
            items: [],
          });
        });
    });

    it('should not found by label, return 0 records', async () => {
      const params = new URLSearchParams({
        'label_eq[feature]': 'true',
      });

      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 0,
              itemCount: 0,
              itemsPerPage: 25,
              totalPages: 0,
              currentPage: 1,
            },
            items: [],
          });
        });
    });

    it('should not found by attribute and label, return 0 records', async () => {
      const params = new URLSearchParams({
        'attr_eq[category]': 'test',
        'label_eq[feature]': 'true',
      });

      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 0,
              itemCount: 0,
              itemsPerPage: 25,
              totalPages: 0,
              currentPage: 1,
            },
            items: [],
          });
        });
    });

    it('should throw exception if attr_eq and attr_gte the same', async () => {
      const params = new URLSearchParams('attr_eq[year]=2018&attr_gte[year]=2014');
      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: 'ATTRIBUTE_DUPLICATED',
            statusCode: 400,
          });
        });
    });

    it('should throw exception if attr_eq and attr_lte the same', async () => {
      const params = new URLSearchParams('attr_eq[year]=2018&attr_lte[year]=2014');
      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: 'ATTRIBUTE_DUPLICATED',
            statusCode: 400,
          });
        });
    });

    it('should throw exception if attr_gte the same', async () => {
      const params = new URLSearchParams('attr_gte[year]=2018&attr_gte[year]=2014');
      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: 'ATTRIBUTE_DUPLICATED',
            statusCode: 400,
          });
        });
    });

    it('should return empty list if attr_lte is different and not found records', async () => {
      const params = new URLSearchParams('attr_lte[year]=2018&attr_lte[cat]=2014');
      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            items: [],
            meta: {
              currentPage: 1,
              itemCount: 0,
              itemsPerPage: 25,
              totalItems: 0,
              totalPages: 0,
            },
          });
        });
    });

    it('should throw exception if attr_lte the same', async () => {
      const params = new URLSearchParams('attr_lte[year]=2018&attr_lte[year]=2014');
      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: 'ATTRIBUTE_DUPLICATED',
            statusCode: 400,
          });
        });
    });

    it('should return empty list if attr_lte is different and not found records', async () => {
      const params = new URLSearchParams('attr_lte[year]=2018&attr_lte[cat]=2014');
      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            items: [],
            meta: {
              currentPage: 1,
              itemCount: 0,
              itemsPerPage: 25,
              totalItems: 0,
              totalPages: 0,
            },
          });
        });
    });

    it('should throw exception if attr_gte is greater than attr_lte', async () => {
      const params = new URLSearchParams('attr_gte[year]=2018&attr_lte[year]=2014');
      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: 'ATTRIBUTE_LTE_MUST_BE_GREATER_THAN_GTE',
            statusCode: 400,
          });
        });
    });

    it('should return list if attr_lte is greater than attr_gte', async () => {
      const attributes = [
        await createAttribute({
          trait: 'year',
          value: '2014',
          assetId: assets[0].id,
        }),
      ];
      const params = new URLSearchParams('attr_gte[year]=2014&attr_lte[year]=2018');
      const result = [Object.assign(assets[0], { attributes: [attributes[0]] })];
      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 1,
              itemCount: 1,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: assetsTransformer.transformAll(result),
          });
        });
    });

    it('should empty list if there is no results', () => {
      const params = new URLSearchParams({
        query: 'carrot',
      });

      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 0,
              itemCount: 0,
              itemsPerPage: 25,
              totalPages: 0,
              currentPage: 1,
            },
            items: [],
          });
        });
    });

    it('should return empty list if name or description has not include searched a word', () => {
      const params = new URLSearchParams({
        search: 'carrot',
      });

      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 0,
              itemCount: 0,
              itemsPerPage: 25,
              totalPages: 0,
              currentPage: 1,
            },
            items: [],
          });
        });
    });

    it('should empty list if second page is empty', () => {
      const params = new URLSearchParams({
        page: '2',
      });

      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 0,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 2,
            },
            items: [],
          });
        });
    });

    it('should 400 exception if params are invalid', () => {
      const params = new URLSearchParams({
        page: '-4',
        limit: '-10',
        sort: 'sausage',
        order: 'NULL',
      });

      return request(app.getHttpServer())
        .get(`/v1/assets?${params.toString()}`)
        .send()
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: [
              'sort must be a valid enum value',
              'page must not be less than 1',
              'limit must not be less than 0',
              'order must be a valid enum value',
            ],
            statusCode: 400,
          });
        });
    });

    it('should return valid meta if asset has multiple attributes', async () => {
      await Event.delete({});
      await Asset.delete({});

      const asset1 = await createAsset({ partner, refId: '1', name: 'test-1' });
      const asset2 = await createAsset({ partner, refId: '2', name: 'test-2' });
      const asset3 = await createAsset({ partner, refId: '3', name: 'test-3' });

      await createAttribute({ asset: asset1 });
      await createAttribute({ asset: asset1 });
      await createAttribute({ asset: asset1 });
      await createAttribute({ asset: asset2 });

      const assetWithAttributes1 = await Asset.findOne(asset1.id, { relations: ['attributes'] });
      const assetWithAttributes2 = await Asset.findOne(asset2.id, { relations: ['attributes'] });
      const assetWithAttributes3 = await Asset.findOne(asset3.id, { relations: ['attributes'] });

      return request(app.getHttpServer())
        .get(`/v1/assets`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
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
          });
        });
    });
  });
  it('should return valid meta if asset has media', async () => {
    await Attribute.delete({});
    await Event.delete({});
    await Media.delete({});
    await Asset.delete({});

    const asset1 = await createAsset({ partner, refId: '123', name: 'test-1' });
    const asset2 = await createAsset({ partner, refId: '124', name: 'test-2' });
    const asset3 = await createAsset({ partner, refId: '125', name: 'test-3' });

    const imageMedia = await createImageMedia({ asset: asset1, sortOrder: 1 });
    await createImageMedia({ asset: asset1, sortOrder: 2 });
    await createImageMedia({ asset: asset1, sortOrder: 3 });
    const videoMedia = await createVideoMedia({ asset: asset2, sortOrder: 1 });

    const assetWithMedia1 = await Asset.findOne(asset1.id, { relations: ['media'] });
    const assetWithMedia2 = await Asset.findOne(asset2.id, { relations: ['media'] });
    const assetWithMedia3 = await Asset.findOne(asset3.id, { relations: ['media'] });

    const media3 = mediaTransformer.transformAll(assetWithMedia3.media);
    const media2 = mediaTransformer.transformAll([videoMedia]);
    const media1 = mediaTransformer.transformAll([imageMedia]);

    return request(app.getHttpServer())
      .get(`/v1/assets`)
      .send()
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({
          meta: {
            totalItems: 3,
            itemCount: 3,
            itemsPerPage: 25,
            totalPages: 1,
            currentPage: 1,
          },
          items: assetsTransformer.transformAll([
            Object.assign(assetWithMedia3, { media: media3 }),
            Object.assign(assetWithMedia2, { media: media2 }),
            Object.assign(assetWithMedia1, { media: media1 }),
          ]),
        });
      });
  });
});
