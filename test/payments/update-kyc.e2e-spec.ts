import { HttpException, HttpStatus, INestApplication } from '@nestjs/common';
import { BasicKycDto } from 'modules/payments/dto/basic-kyc.dto';
import request from 'supertest';
import { clearAllData, createApp } from '../utils/app.utils';
import { mockBasicKycQuery, paymentsAccountCreationSuccess } from 'modules/payments/test-variables';
import { createUser } from '../utils/create-user';
import { User } from 'modules/users/entities';
import { generateToken } from '../utils/jwt.utils';
import { createMockBasicKycParams } from '../utils/payments-account';

let app: INestApplication;
const mockBasicKyc: BasicKycDto = mockBasicKycQuery;
let user: User;
let headers;
let mockParams;
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
  mockParams = createMockBasicKycParams(user);
});

afterEach(async () => {
  jest.clearAllMocks();
  await clearAllData();
});

async function createFboAccount(returnedUser) {
  mockCreateUser.mockResolvedValueOnce(returnedUser);
  await request(app.getHttpServer())
    .post(`/v1/payments/kyc`)
    .set(headers)
    .send(mockParams)
    .expect(HttpStatus.CREATED)
    .expect(({ body }) => {
      expect(body.status).toBe(HttpStatus.CREATED);
    });
}

describe('update kyc', () => {
  test('should throw erorr if no payment account exists', async () => {
    await request(app.getHttpServer())
      .post(`/v1/payments/update-kyc`)
      .set(headers)
      .send(mockParams)
      .expect(HttpStatus.NOT_FOUND)
      .expect(({ body }) => {
        expect(body.status).toBe(HttpStatus.NOT_FOUND);
      });
  });

  test('should throw error if params are not correct', async () => {
    const mockParams = createMockBasicKycParams(user, { phone_numbers: '111.111.111' });
    await request(app.getHttpServer())
      .post(`/v1/payments/update-kyc`)
      .set(headers)
      .send(mockParams)
      .expect(HttpStatus.BAD_REQUEST)
      .expect(({ error, body }) => {
        expect(error).toBeDefined();
        expect(body.message).toBe('Form errors');
        expect(body.error.phone_numbers).toEqual(['phone_numbers must be a valid phone number']);
      });
  });

  test('should return 404 if account does not exist', async () => {
    mockGetUser.mockResolvedValueOnce({ body: paymentsAccountCreationSuccess });

    await request(app.getHttpServer())
      .post(`/v1/payments/update-kyc`)
      .set(headers)
      .send(mockParams)
      .expect(HttpStatus.NOT_FOUND)
      .expect(({ body }) => {
        expect(body.status).toBe(HttpStatus.NOT_FOUND);
        expect(body.error).toEqual('Payments Account Not Found');
      });
  });

  test('should return if FBO account does not exist ', async () => {
    // mockCreateUser.mockResolvedValueOnce(paymentsAccountCreationSuccess.User);
    mockGetUser.mockImplementation(() => {
      return Promise.reject(
        new HttpException({ status: HttpStatus.NOT_FOUND }, HttpStatus.NOT_FOUND),
      );
    });

    await createFboAccount(paymentsAccountCreationSuccess.User);

    await request(app.getHttpServer())
      .post(`/v1/payments/update-kyc`)
      .set(headers)
      .send(mockParams)
      .expect(HttpStatus.NOT_FOUND)
      .expect(({ body }) => {
        expect(body.status).toBe(HttpStatus.NOT_FOUND);
        expect(body.error).toEqual('Payments Account Not Found');
      });
  });

  test('should return 400 BAD REQUEST if document id does not exist', async () => {
    mockGetUser.mockResolvedValueOnce({ body: { documents: undefined } });
    const mockParams = createMockBasicKycParams(user);

    await createFboAccount(paymentsAccountCreationSuccess.User);

    await request(app.getHttpServer())
      .post(`/v1/payments/update-kyc`)
      .set(headers)
      .send(mockParams)
      .expect(HttpStatus.BAD_REQUEST)
      .expect(({ body }) => {
        expect(body.status).toBe(HttpStatus.CREATED);
      });
  });

  test('should update address', async () => {
    test.todo;
  });

  test('should update personal information', async () => {
    test.todo;
  });

  test('should update account to deleted', async () => {
    test.todo;
  });

  test('should update document to deleted', async () => {
    test.todo;
  });
});
