import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateAccountDto } from 'modules/synapse/dto/create-account.dto';
import request from 'supertest';
import { createApp } from '../utils/app.utils';
import { SynapseController } from 'modules/synapse/controllers/synapse.controller';
import { SynapseService } from 'modules/synapse/providers/synapse.service';
import { account201, account303, mockCreateAccountQuery } from 'modules/synapse/test-variables';
import { createUser } from '../utils/create-user';
import { UserSynapse } from 'modules/synapse/entities/user-synapse.entity';
import { User } from 'modules/users/entities';
import { generateToken } from '../utils/jwt.utils';

describe('Synapse Controller', () => {
  let app: INestApplication;
  let synapseController: SynapseController;
  let synapseService: SynapseService;
  const mockCreateAccountDto: CreateAccountDto = mockCreateAccountQuery;
  let user: User;
  let headers;

  beforeEach(async () => {
    headers = { Authorization: `Bearer ${generateToken(user)}` };
  });

  afterAll(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('mock call to Synapse', () => {
    const mockProviders = [
      {
        provide: SynapseService,
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        useValue: { createSynapseUserAccount: () => account201 },
      },
    ];

    beforeAll(async () => {
      app = await createApp(mockProviders);
      user = await createUser({ email: 'test@example.com' });

      synapseService = app.get<SynapseService>(SynapseService);
      synapseController = app.get<SynapseController>(SynapseController);
    });

    it('Synapse mocks should be defined', () => {
      expect(synapseService).toBeDefined();
      expect(synapseController).toBeDefined();
    });

    test('Should create a new user account', async () => {
      const spy = jest
        .spyOn(synapseService, 'createSynapseUserAccount')
        .mockImplementation(async () => account201);

      const response = await synapseController.createUser(
        mockCreateAccountDto,
        user,
        '::ffff:172.18.0.1',
      );

      expect(spy).toHaveBeenCalled();

      expect(response).toStrictEqual(account201);
    });

    test('Should return the users account if it already exists', async () => {
      const spy = jest
        .spyOn(synapseService, 'createSynapseUserAccount')
        .mockImplementation(async () => account303);

      const response = await synapseController.createUser(
        mockCreateAccountDto,
        user,
        '::ffff:172.18.0.1',
      );

      expect(spy).toHaveBeenCalled();

      expect(response).toStrictEqual(account303);
    });
  });

  describe('Should verify account info being saved and returned', () => {
    beforeAll(async () => {
      app = await createApp();
      user = await createUser({ email: 'test@example.com' });
    });

    test('Should update database synapse details for the user', async () => {
      await request(app.getHttpServer())
        .post(`/v1/synapse/user`)
        .set(headers)
        .send(mockCreateAccountDto)
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(body.status).toBe(HttpStatus.CREATED);
          return body;
        });

      const userSynapseAccount = await UserSynapse.findAccountByUser(user.id);

      expect(userSynapseAccount).not.toBeNull();
    });
    // test('Should return the users synapse account details if the account already existed', () => {
    //   // const userSynapse = createSynapseUser(userId, userSynapseId, depositNodeId, refreshToken);
    // });
  });
});
