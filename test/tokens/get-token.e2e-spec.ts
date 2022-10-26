import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { Asset, Contract, Media, Token } from 'modules/assets/entities';
import { createAsset } from '@/test/utils/asset.utils';
import { File } from 'modules/storage/entities/file.entity';
import { Partner } from 'modules/partners/entities';
import { createPartner } from '../utils/partner.utils';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { TokensTransformer } from 'modules/assets/transformers/tokens.transformer';
import { createContract } from '../utils/contract.utils';
import { createToken } from '../utils/token.utils';
import { createImageMedia, createVideoMedia } from '../utils/media.utils';
import { createFile } from '@/test/utils/file.utils';
import { MediaTransformer } from 'modules/assets/transformers/media.transformer';
import { StatusCodes } from 'http-status-codes';

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
        description: 'test-egg',
      },
      partner,
    );
    file = await createFile({});
    media = await createImageMedia({ assetId: asset.id, file, fileId: file.id });
    token = await createToken({ assetId: asset.id, asset, contract, contractId: contract.id });
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`GET V1 /token/:contractAddress/:tokenId`, () => {
    test('should return token for image media', async () => {
      const response = {
        ...tokensTransformer.transform(token),
        media: mediaTransformer.transformAll([media]),
      };
      return request(app.getHttpServer())
        .get(`/v1/token/${contract.address}/${token.tokenId}`)
        .send()
        .expect(StatusCodes.OK)
        .expect(({ body }) => {
          expect(body).toEqual(response);
        });
    });

    test('should return token for youtube media', async () => {
      const assetWithVideo = await createAsset(
        {
          refId: '2',
          name: 'Egg-1',
          description: 'test-egg',
        },
        partner,
      );
      const contract2 = await createContract({});
      const videoMedia = await createVideoMedia({ assetId: assetWithVideo.id });
      const videoToken = await createToken({
        assetId: assetWithVideo.id,
        asset: assetWithVideo,
        contract: contract2,
      });

      const response = {
        ...tokensTransformer.transform(videoToken),
        media: mediaTransformer.transformAll([videoMedia]),
      };

      return request(app.getHttpServer())
        .get(`/v1/token/${contract.address}/${videoToken.tokenId}`)
        .send()
        .expect(StatusCodes.OK)
        .expect(({ body }) => {
          expect(body).toEqual(response);
        });
    });

    test('should 400 exception tokenId is invalid', async () => {
      return request(app.getHttpServer())
        .get(`/v1/token/${contract.address}/123`)
        .send()
        .expect(StatusCodes.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: 'MUST_BE_UUID',
            statusCode: StatusCodes.BAD_REQUEST,
          });
        });
    });
    test('should 404 error if address is wrong', () => {
      return request(app.getHttpServer())
        .get(`/v1/token/wrongAddress/${token.tokenId}`)
        .send()
        .expect(StatusCodes.NOT_FOUND)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Not Found',
            message: 'TOKEN_NOT_FOUND',
            statusCode: StatusCodes.NOT_FOUND,
          });
        });
    });
  });
});
