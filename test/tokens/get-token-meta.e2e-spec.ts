import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp, mockS3Provider } from '@/test/utils/app.utils';
import { Asset, Contract, Token } from 'modules/assets/entities';
import { createAsset } from '@/test/utils/asset.utils';
import { createFile } from '@/test/utils/file.utils';
import { Partner } from 'modules/partners/entities';
import { createPartner } from '../utils/partner.utils';
import { User } from 'modules/users/user.entity';
import { createUser } from '../utils/fixtures/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { TokensTransformer } from 'modules/assets/transformers/tokens.transformer';
import { createContract } from '../utils/contract.utils';
import { createToken, deleteToken } from '../utils/token.utils';

describe('TokensController', () => {
  let app: INestApplication;
  let asset: Asset;
  let partner: Partner;
  let user: User;
  let contract: Contract;
  let token: Token;
  let tokensTransformer: TokensTransformer;
  const mockedFileUrl = 'http://example.com';

  beforeAll(async () => {
    app = await createApp();
    tokensTransformer = app.get(TokensTransformer);
    user = await createUser({ email: 'partner@test.com', role: RoleEnum.USER });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
    contract = await createContract({});
    asset = await createAsset({
      refId: '1',
      name: 'Egg',
      image: await createFile(),
      slug: 'egg',
      description: 'test-egg',
      partner,
    });
    token = await createToken({
      assetId: asset.id,
      asset,
      contractId: contract.id,
      contract,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`GET /token/meta/:contractAddress/:tokenId`, () => {
    it('should return meta token', async () => {
      mockS3Provider.getUrl.mockReturnValue(mockedFileUrl);

      return request(app.getHttpServer())
        .get(`/token/meta/${contract.address}/${token.tokenId}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(tokensTransformer.transformMeta(token));
        });
    });

    it('should return meta token json', async () => {
      mockS3Provider.getUrl.mockReturnValue(mockedFileUrl);

      return request(app.getHttpServer())
        .get(`/token/meta/${contract.address}/${token.tokenId}.json`)
        .send()
        .expect(200)
        .expect(({ text }) => {
          expect(text).toEqual(JSON.stringify(tokensTransformer.transformMeta(token)));
        });
    });

    it('should 400 exception tokenId is invalid', () => {
      return request(app.getHttpServer())
        .get(`/token/meta/${contract.address}/123`)
        .send()
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: ['tokenId must be a UUID'],
            statusCode: 400,
          });
        });
    });

    it('should 404 error if address is wrong', () => {
      return request(app.getHttpServer())
        .get(`/token/meta/wrongAddress/${token.tokenId}`)
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