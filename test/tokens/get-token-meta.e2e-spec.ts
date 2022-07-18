import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp, mockS3Provider } from '@/test/utils/app.utils';
import { Asset, Contract, Media, Token } from 'modules/assets/entities';
import { createAsset } from '@/test/utils/asset.utils';
import { Partner } from 'modules/partners/entities';
import { createPartner } from '../utils/partner.utils';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { TokensTransformer } from 'modules/assets/transformers/tokens.transformer';
import { createContract } from '../utils/contract.utils';
import { createToken } from '../utils/token.utils';
import { createImageMedia } from '../utils/media.utils';
import { File } from 'modules/storage/entities/file.entity';
import { createFile } from '../utils/file.utils';
import { MediaTransformer } from 'modules/assets/transformers/media.transformer';

describe('TokensController', () => {
  let app: INestApplication;
  let asset: Asset;
  let partner: Partner;
  let user: User;
  let contract: Contract;
  let token: Token;
  let file: File;
  let media: Media;
  let tokensTransformer: TokensTransformer;
  let mediaTransformer: MediaTransformer;
  const mockedFileUrl = 'http://example.com';

  beforeAll(async () => {
    app = await createApp();
    tokensTransformer = app.get(TokensTransformer);
    mediaTransformer = app.get(MediaTransformer);
    user = await createUser({ email: 'partner@test.com', role: RoleEnum.USER });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
    contract = await createContract({});
    asset = await createAsset(
      {
        refId: '1',
        name: 'Egg',
        slug: 'egg',
        description: 'test-egg',
      },
      partner,
    );
    token = await createToken({
      assetId: asset.id,
      asset,
      contractId: contract.id,
      contract,
    });
    file = await createFile({});
    media = await createImageMedia({ assetId: asset.id, file, fileId: file.id });
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`GET V1 /token/meta/:contractAddress/:tokenId`, () => {
    test('should return meta token', async () => {
      mockS3Provider.getUrl.mockReturnValue(mockedFileUrl);
      const { traits, ...rest } = tokensTransformer.transform(token);
      const response = {
        ...rest,
        properties: traits,
        media: mediaTransformer.transformAll([media]),
      };

      return request(app.getHttpServer())
        .get(`/v1/token/meta/${contract.address}/${token.tokenId}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(response);
        });
    });

    test('should return meta token json', async () => {
      mockS3Provider.getUrl.mockReturnValue(mockedFileUrl);

      const { traits, ...rest } = tokensTransformer.transform(token);
      const response = {
        ...rest,
        properties: traits,
        media: mediaTransformer.transformAll([media]),
      };

      return request(app.getHttpServer())
        .get(`/v1/token/meta/${contract.address}/${token.tokenId}.json`)
        .send()
        .expect(200)
        .expect(({ text }) => {
          expect(text).toEqual(JSON.stringify(response));
        });
    });

    test('should 400 exception tokenId is invalid', () => {
      return request(app.getHttpServer())
        .get(`/v1/token/meta/${contract.address}/123`)
        .send()
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: 'MUST_BE_UUID',
            statusCode: 400,
          });
        });
    });

    test('should 404 error if address is wrong', () => {
      return request(app.getHttpServer())
        .get(`/v1/token/meta/wrongAddress/${token.tokenId}`)
        .send()
        .expect(404)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Not Found',
            message: 'TOKEN_NOT_FOUND',
            statusCode: 404,
          });
        });
    });
  });
});
