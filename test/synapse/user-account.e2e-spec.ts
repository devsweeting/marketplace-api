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
import { createMockAccountParams } from '../utils/create-synapse-user';

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

  describe('Should verify account info', () => {
    beforeAll(async () => {
      app = await createApp();
      user = await createUser({ email: 'test@example.com' });
    });

    test('Should update database synapse details for the user', async () => {
      const mockParams = createMockAccountParams(user);
      await request(app.getHttpServer())
        .post(`/v1/synapse/user`)
        .set(headers)
        .send(mockParams)
        .expect(HttpStatus.CREATED)
        .expect(({ body, error }) => {
          if (error) {
            console.log('error', error);
          }
          expect(body.status).toBe(HttpStatus.CREATED);
        });

      const userSynapseAccount = await UserSynapse.findAccountByUser(user.id);

      expect(userSynapseAccount).not.toBeNull();
    });

    test('Should return a custom 400 if the params are malformed', async () => {
      const mockParams = createMockAccountParams(user, { phone_numbers: '111.111.111' });
      await request(app.getHttpServer())
        .post(`/v1/synapse/user`)
        .set(headers)
        .send(mockParams)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ error, body }) => {
          expect(error).toBeDefined();
          expect(body.message).toBe('Form errors');
          expect(body.error.phone_numbers).toEqual(['phone_numbers must be a valid phone number']);
        });
    });
  });
});
