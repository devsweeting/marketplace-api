import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateAccountDto } from 'modules/synapse/dto/create-account.dto';
import request from 'supertest';
import { createApp } from '../utils/app.utils';
import { SynapseController } from 'modules/synapse/controllers/synapse.controller';
import { SynapseService } from 'modules/synapse/providers/synapse.service';
import {
  mockCreateAccountQuery,
  synapseSavedUserCreatedResponse,
} from 'modules/synapse/test-variables';
import { User } from '@sentry/node';
import { createUser } from '../utils/create-user';
import { UserSynapse } from 'modules/synapse/entities/user-synapse.entity';

describe('Synapse Controller', () => {
  let app: INestApplication;
  let synapseController: SynapseController;
  let synapseService: SynapseService;
  const mockCreateAccountDto: CreateAccountDto = mockCreateAccountQuery;
  let user: User;

  const providers = [
    {
      provide: SynapseService,
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      useValue: { createSynapseUserAccount: () => synapseSavedUserCreatedResponse.User.body },
    },
  ];

  beforeAll(async () => {
    app = await createApp(providers);
    user = await createUser({ email: 'test@example.com' });

    synapseService = app.get<SynapseService>(SynapseService);
    synapseController = app.get<SynapseController>(SynapseController);
  });

  afterAll(async () => {
    await app.close();
    // await clearAllData(); //THROWS ERROR -> TypeORMError: Driver not Connected
  });

  // beforeEach(async () => {});

  it('should be defined', () => {
    expect(synapseService).toBeDefined();
    expect(synapseController).toBeDefined();
  });

  describe('createUser', () => {
    test('Should create a new user account', async () => {
      const newAccount = synapseSavedUserCreatedResponse.User.body;

      const spy = jest
        .spyOn(synapseService, 'createSynapseUserAccount')
        .mockImplementation(async () => newAccount);

      const response = await synapseController.createUser(
        mockCreateAccountDto,
        '::ffff:172.18.0.1',
      );

      expect(spy).toHaveBeenCalled();

      expect(response).toStrictEqual({
        status: 201,
        newAccount,
      });
    });

    test('Should update database synapse details for the user', async () => {
      await request(app.getHttpServer())
        .post(`/v1/synapse/user`)
        .send(mockCreateAccountDto)
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          return body;
        });

      const userSynapseAccount = await UserSynapse.findAccountByUser(user.id);
      expect(userSynapseAccount).not.toBeNull();
    });
  });
  // test('Should create a new synapse account without KYC if none exists', () => {
  //   const userSynapse = createSynapseUser(userId, userSynapseId, depositNodeId, refreshToken)
  // });
});
