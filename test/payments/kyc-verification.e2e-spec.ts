import { HttpException, HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { clearAllData, createApp } from '../utils/app.utils';
import { createUser } from '../utils/create-user';
import { UserPaymentsAccount } from 'modules/payments/entities/user-payments-account.entity';
import { User } from 'modules/users/entities';
import { generateToken } from '../utils/jwt.utils';
import { createMockBasicKycParams } from '../utils/payments-account';
import { paymentsAccountCreationSuccess } from 'modules/payments/test-variables';
let app: INestApplication;
let user: User;
let userWithNoAccount: User;
let headers;

const mockCreateUser = jest.fn();
const mockGetUser = jest.fn();
jest.mock('synapsenode', () => {
  return {
    Client: jest
      .fn()
      .mockImplementation(() => ({ createUser: mockCreateUser, getUser: mockGetUser })),
  };
});

afterAll(async () => {
  await app.close();
  jest.clearAllMocks();
});
beforeAll(async () => {
  app = await createApp();
});
beforeEach(async () => {
  user = await createUser({ email: 'test@example.com' });
  headers = { Authorization: `Bearer ${generateToken(user)}` };
});

afterEach(async () => {
  jest.clearAllMocks();
  await clearAllData();
});

describe('Create payments account e2e', () => {
  describe('POST - create and verify a users payments account', () => {
    test('Should update database payments account details for user', async () => {
      mockCreateUser.mockResolvedValueOnce(paymentsAccountCreationSuccess.User);
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
      expect(userPaymentsAccount).toBeDefined();
      expect(userPaymentsAccount.userId).toBe(user.id);
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

    test('should correctly return synapse error', async () => {
      mockCreateUser.mockImplementationOnce(() => {
        return Promise.reject(
          new HttpException({ data: { error: { en: 'test' } } }, HttpStatus.BAD_REQUEST),
        );
      });

      const mockParams = createMockBasicKycParams(user);

      await request(app.getHttpServer())
        .post(`/v1/payments/kyc`)
        .set(headers)
        .send(mockParams)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body.error).toBe('Could not create user payments account');
          expect(body.message).toBe('test');
        });
    });
  });

  describe('GET - user payment account details', () => {
    test('Should return the users payment account information', async () => {
      mockCreateUser.mockResolvedValueOnce(paymentsAccountCreationSuccess.User);
      mockGetUser.mockResolvedValueOnce({ body: paymentsAccountCreationSuccess });

      const mockParams = createMockBasicKycParams(user);

      await request(app.getHttpServer())
        .post(`/v1/payments/kyc`)
        .set(headers)
        .send(mockParams)
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(body.status).toBe(HttpStatus.CREATED);
        });

      await request(app.getHttpServer())
        .get(`/v1/payments/account`)
        .set(headers)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.status).toBe(HttpStatus.OK);
          expect(body.data).toBeDefined();
          expect(body.data.user.id).toBe(user.id);
          expect(body.data.account.User.id).toBe(paymentsAccountCreationSuccess.User.id);
        });
    });

    test('should throw if no FBO account is found', async () => {
      mockCreateUser.mockResolvedValueOnce(paymentsAccountCreationSuccess.User);
      mockGetUser.mockImplementation(() => {
        return Promise.reject(
          new HttpException({ status: HttpStatus.NOT_FOUND }, HttpStatus.NOT_FOUND),
        );
      });

      const mockParams = createMockBasicKycParams(user);
      await request(app.getHttpServer())
        .post(`/v1/payments/kyc`)
        .set(headers)
        .send(mockParams)
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(body.status).toBe(HttpStatus.CREATED);
        });

      await request(app.getHttpServer())
        .get(`/v1/payments/account`)
        .set(headers)
        // .expect(HttpStatus.NOT_FOUND)
        .expect(({ body }) => {
          expect(body.status).toBe(HttpStatus.NOT_FOUND);
          expect(body.error).toBe('Payments Account Not Found');
          expect(body.message).toBe(
            `Cannot locate a FBO payments account with account ID -- ${paymentsAccountCreationSuccess.User.id}`,
          );
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
          expect(body.error).toBe('Payments Account Not Found');
        });
    });
  });
});
