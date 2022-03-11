import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Injectable } from '@nestjs/common/interfaces';

import { AppModule } from '@/src/app.module';
import { AuthModule } from '@/src/modules/auth/auth.module';
import validationPipe from '@/src/modules/common/pipes/validation.pipe';
import { User } from 'modules/users/user.entity';
import { Asset, Attribute } from 'modules/assets/entities';
import { Partner } from 'modules/partners/entities';

let app: INestApplication;

interface MockProvider {
  provide: Injectable;
  useValue: object;
}

export const configureTestApp = (
  moduleFixture: TestingModule,
  appInstance: INestApplication,
): INestApplication => {
  // eslint-disable-next-line no-param-reassign
  appInstance = moduleFixture.createNestApplication();
  appInstance.useGlobalPipes(validationPipe);

  return appInstance;
};

export const createApp = async (providers: MockProvider[] = []): Promise<INestApplication> => {
  const module = Test.createTestingModule({
    imports: [AppModule, AuthModule],
  });

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
  await Attribute.delete({});
  await Asset.delete({});
  await Partner.delete({});
  await User.delete({});
};
