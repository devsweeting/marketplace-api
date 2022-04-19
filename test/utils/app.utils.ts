import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Injectable } from '@nestjs/common/interfaces';

import { AppModule } from '@/src/app.module';
import { AuthModule } from '@/src/modules/auth/auth.module';
import validationPipe from '@/src/modules/common/pipes/validation.pipe';
import { User } from 'modules/users/user.entity';
import { Asset, Attribute, Contract, Label, Media, Token } from 'modules/assets/entities';
import { Event } from 'modules/events/entities';
import { Partner, PartnerMemberUser } from 'modules/partners/entities';
import { S3Provider } from 'modules/storage/providers/s3.provider';
import { FileDownloadService } from 'modules/storage/file-download.service';
import { Collection, CollectionAsset } from 'modules/collections/entities';

let app: INestApplication;

interface MockProvider {
  provide: Injectable;
  useValue: object;
}

export const mockS3Provider = {
  upload: jest.fn(),
  getUrl: jest.fn(),
};

export const mockFileDownloadService = {
  download: jest.fn(),
};

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

  module.overrideProvider(S3Provider).useValue(mockS3Provider);
  module.overrideProvider(FileDownloadService).useValue(mockFileDownloadService);

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
  await Label.delete({});
  await Event.delete({});
  await Media.delete({});
  await Token.delete({});
  await Asset.delete({});
  await Contract.delete({});
  await PartnerMemberUser.delete({});
  await Partner.delete({});
  await User.delete({});
  await Collection.delete({});
  await CollectionAsset.delete({});
};
