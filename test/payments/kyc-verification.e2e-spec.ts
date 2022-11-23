import { HttpStatus, INestApplication } from '@nestjs/common';
import { BasicKycDto } from 'modules/payments/dto/basic-kyc.dto';
import request from 'supertest';
import { createApp } from '../utils/app.utils';
import { PaymentsController } from 'modules/payments/controllers/payments.controller';
import { PaymentsService } from 'modules/payments/providers/payments.service';
import { account201, account303, mockBasicKycQuery } from 'modules/payments/test-variables';
import { createUser } from '../utils/create-user';
import { UserPaymentsAccount } from 'modules/payments/entities/user-payments-account.entity';
import { User } from 'modules/users/entities';
import { generateToken } from '../utils/jwt.utils';
import { createMockBasicKycParams, createMockPaymentsAccount } from '../utils/payments-account';

describe('Payments Controller', () => {
  let app: INestApplication;
  let paymentsController: PaymentsController;
  let paymentsService: PaymentsService;
  const mockBasicKyc: BasicKycDto = mockBasicKycQuery;
  let user: User;
  let userWithNoAccount: User;
  let headers;

  beforeEach(async () => {
    headers = { Authorization: `Bearer ${generateToken(user)}` };
  });

  afterAll(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('mock payment provider API', () => {
    const mockProviders = [
      {
        provide: PaymentsService,
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        useValue: { submitKYC: () => account201 },
      },
    ];

    beforeAll(async () => {
      app = await createApp(mockProviders);
      user = await createUser({ email: 'test@example.com' });

      paymentsService = app.get<PaymentsService>(PaymentsService);
      paymentsController = app.get<PaymentsController>(PaymentsController);
    });

    it('Payment mocks should be defined', () => {
      expect(paymentsService).toBeDefined();
      expect(paymentsController).toBeDefined();
    });

    test('Should create a new user account', async () => {
      const spy = jest
        .spyOn(paymentsService, 'submitKYC')
        .mockImplementation(async () => account201);

      const response = await paymentsController.createUser(mockBasicKyc, user, '::ffff:172.18.0.1');

      expect(spy).toHaveBeenCalled();

      expect(response).toStrictEqual(account201);
    });

    test('Should return the users account if it already exists', async () => {
      const spy = jest
        .spyOn(paymentsService, 'submitKYC')
        .mockImplementation(async () => account303);

      const response = await paymentsController.createUser(mockBasicKyc, user, '::ffff:172.18.0.1');

      expect(spy).toHaveBeenCalled();

      expect(response).toStrictEqual(account303);
    });
  });

  describe('POST - create and verify a users payments account', () => {
    beforeAll(async () => {
      app = await createApp();
      user = await createUser({ email: 'testuser@example.com' });
    });

    test('Should update database payments account details for user', async () => {
      const mockParams = createMockBasicKycParams(user);
      await request(app.getHttpServer())
        .post(`/v1/payments/kyc`)
        .set(headers)
        .send(mockParams)
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(body.status).toBe(HttpStatus.CREATED);
        });

      const userPaymentsAccount = await UserPaymentsAccount.findAccountByUserId(user.id);

      expect(userPaymentsAccount).not.toBeNull();
    });

    test('Should return a custom 400 if the params are malformed', async () => {
      const mockParams = createMockBasicKycParams(user, { phone_numbers: '111.111.111' });
      await request(app.getHttpServer())
        .post(`/v1/payments/kyc`)
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

  describe('GET - user payment account details', () => {
    beforeAll(async () => {
      app = await createApp();
      user = await createUser({ email: 'anothertest@example.com' });
    });

    test('Should return the users payment account information', async () => {
      await createMockPaymentsAccount(user);
      await request(app.getHttpServer())
        .get(`/v1/payments/account`)
        .set(headers)
        // .expect(HttpStatus.OK)
        .expect(({ body }) => {
          console.log('body', body);
          expect(body.status).toBe(HttpStatus.OK);
          expect(body.data).toBeDefined();
          expect(body.data.user).toBeDefined();
          expect(body.data.account).toBeDefined();
        });
    });

    test('Should return NOT_FOUND if there is no payments account associated with the user', async () => {
      userWithNoAccount = await createUser({ email: 'no-account@example.com' });
      headers = { Authorization: `Bearer ${generateToken(userWithNoAccount)}` };
      await request(app.getHttpServer())
        .get(`/v1/payments/account`)
        .set(headers)
        .expect(HttpStatus.NOT_FOUND)
        .expect(({ body }) => {
          expect(body.status).toBe(HttpStatus.NOT_FOUND);
        });
    });
  });
});
