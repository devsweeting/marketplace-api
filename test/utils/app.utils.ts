import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import { Injectable } from '@nestjs/common/interfaces';
import request from 'supertest';
import { AppModule } from '@/src/app.module';
import { AuthModule } from '@/src/modules/auth/auth.module';
import validationPipe from '@/src/modules/common/pipes/validation.pipe';
import { User } from 'modules/users/entities/user.entity';
import { Asset, Attribute, Contract, Label, Media, Token } from 'modules/assets/entities';
import { Event } from 'modules/events/entities';
import { Partner, PartnerMemberUser } from 'modules/partners/entities';
import { File } from 'modules/storage/entities/file.entity';
import { Collection, CollectionAsset } from 'modules/collections/entities';
import { Watchlist, WatchlistAsset } from 'modules/watchlists/entities';
import { UserLogin, UserOtp } from 'modules/users/entities';
import { MailerService } from '@nestjs-modules/mailer';
import { SellOrder, SellOrderPurchase } from 'modules/sell-orders/entities';

export type SupertestResponse = request.Response;

export type RequestMethod = 'get' | 'post' | 'delete' | 'patch';

let app: INestApplication;

interface IMockProvider {
  provide: Injectable;
  useValue: object;
}

export const mockMailerService = {
  sendMail: jest.fn(),
};

export const configureTestApp = (
  moduleFixture: TestingModule,
  appInstance: INestApplication,
): INestApplication => {
  // eslint-disable-next-line no-param-reassign
  appInstance = moduleFixture.createNestApplication();
  appInstance.enableVersioning({
    type: VersioningType.URI,
  });
  appInstance.useGlobalPipes(validationPipe);

  return appInstance;
};

export const createApp = async (providers: IMockProvider[] = []): Promise<INestApplication> => {
  const module = Test.createTestingModule({
    imports: [AppModule, AuthModule],
  });

  if (!providers.some((p) => typeof p.provide === typeof MailerService)) {
    providers.push({
      provide: MailerService,
      useValue: mockMailerService,
    });
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const provider of providers) {
    module.overrideProvider(provider.provide).useValue(provider.useValue);
  }

  const moduleFixture: TestingModule = await module.compile();

  app = configureTestApp(moduleFixture, app);

  await app.init();

  return app;
};

export const clearAllData = async (): Promise<void> => {
  await SellOrderPurchase.delete({});
  await SellOrder.delete({});
  await Attribute.delete({});
  await Label.delete({});
  await Event.delete({});
  await Media.delete({});
  await Token.delete({});
  await WatchlistAsset.delete({});
  await Watchlist.delete({});
  await Asset.delete({});
  await Contract.delete({});
  await PartnerMemberUser.delete({});
  await Partner.delete({});
  await User.delete({});
  await Collection.delete({});
  await CollectionAsset.delete({});
  await File.delete({});
  await UserOtp.delete({});
  await UserLogin.delete({});
  await User.delete({});
};

const expectStatus = (
  method: RequestMethod,
  url: string,
  expectedStatus: number,
  response: SupertestResponse,
): Promise<SupertestResponse> => {
  if (response.status !== expectedStatus) {
    const methodName = method.toUpperCase();
    const { status, body } = response;

    console.error(body);

    throw new Error(`${methodName} ${url} expected status ${expectedStatus}, got ${status}`);
  }

  return Promise.resolve(response);
};

const baseRequest = (
  app: INestApplication,
  method: RequestMethod,
  url: string,
  expectedStatus: number,
  expectedResponse: Record<string, unknown> = {},
  params: Record<string, unknown> = {},
  headers: Record<string, unknown> = {},
): Promise<SupertestResponse> =>
  request(app.getHttpServer())
    [method](url)
    .set('Accept', 'application/json')
    .set(headers)
    .send(params)
    .expect(({ body }) => {
      if (expectedResponse) {
        expect(body).toEqual(expectedResponse);
      }
    })
    .then((response) => expectStatus(method, url, expectedStatus, response));

export const post = (
  app: INestApplication,
  url: string,
  expectedStatus: number,
  expectedResponse: Record<string, unknown> = {},
  params: Record<string, unknown> = {},
  headers: Record<string, unknown> = {},
): Promise<SupertestResponse> =>
  baseRequest(app, 'post', url, expectedStatus, expectedResponse, params, headers);

export const patch = (
  app: INestApplication,
  url: string,
  expectedStatus: number,
  expectedResponse: Record<string, unknown> = {},
  params: Record<string, unknown> = {},
  headers: Record<string, unknown> = {},
): Promise<SupertestResponse> =>
  baseRequest(app, 'patch', url, expectedStatus, expectedResponse, params, headers);

export const del = (
  app: INestApplication,
  url: string,
  expectedStatus: number,
  expectedResponse: Record<string, unknown> = {},
  params: Record<string, unknown> = {},
  headers: Record<string, unknown> = {},
): Promise<SupertestResponse> =>
  baseRequest(app, 'delete', url, expectedStatus, expectedResponse, params, headers);

export const get = (
  app: INestApplication,
  url: string,
  expectedStatus: number,
  expectedResponse: Record<string, unknown> = {},
  params: Record<string, unknown> = {},
  headers: Record<string, unknown> = {},
): Promise<SupertestResponse> =>
  baseRequest(app, 'get', url, expectedStatus, expectedResponse, params, headers);

export const requireAuthorization = async (method: any, expectMsg) => {
  const response = await method;
  expect(response.text).toEqual(expectMsg);
};
