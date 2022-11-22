import { HttpStatus, INestApplication } from '@nestjs/common';
import { BasicKycDto } from 'modules/payments/dto/basic-kyc.dto';
import request from 'supertest';
import { createApp } from '../utils/app.utils';
import { PaymentsController } from 'modules/payments/controllers/payments.controller';
import { PaymentsService } from 'modules/payments/providers/payments.service';
import { mockBasicKycQuery } from 'modules/payments/test-variables';
import { createUser } from '../utils/create-user';
import { UserPaymentsAccount } from 'modules/payments/entities/user-payments-account.entity';
import { User } from 'modules/users/entities';
import { generateToken } from '../utils/jwt.utils';
import { createMockBasicKycParams, createMockPaymentsAccount } from '../utils/payments-account';

let app: INestApplication;
let paymentsController: PaymentsController;
let paymentsService: PaymentsService;
const mockBasicKyc: BasicKycDto = mockBasicKycQuery;
let user: User;
let userWithNoAccount: User;
let headers;
const mockClient = jest.createMockFromModule<typeof import('synapsenode')>('synapsenode');

beforeEach(async () => {
  headers = { Authorization: `Bearer ${generateToken(user)}` };
});

afterAll(async () => {
  await app.close();
  jest.clearAllMocks();
});

describe('Create payments account e2e', () => {
  describe('POST - create and verify a users payments account', () => {
    beforeAll(async () => {
      app = await createApp();
      user = await createUser({ email: 'test@example.com' });
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

      const userPaymentsAccount = await UserPaymentsAccount.findAccountByUser(user.id);

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
      user = await createUser({ email: 'test@example.com' });
    });

    test('Should return the users payment account information', async () => {
      await createMockPaymentsAccount(user);
      await request(app.getHttpServer())
        .get(`/v1/payments/account`)
        .set(headers)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
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
