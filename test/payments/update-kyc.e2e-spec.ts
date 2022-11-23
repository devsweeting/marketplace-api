import { HttpException, HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { clearAllData, createApp } from '../utils/app.utils';
import { paymentsAccountCreationSuccess } from 'modules/payments/test-variables';
import { createUser } from '../utils/create-user';
import { User } from 'modules/users/entities';
import { generateToken } from '../utils/jwt.utils';
import { createMockBasicKycParams } from '../utils/payments-account';

let app: INestApplication;
let user: User;
let headers;
let mockParams;
const mockCreateUser = jest.fn();
const mockGetUser = jest.fn();
const updateUser = jest.fn();
jest.mock('synapsenode', () => {
  return {
    Client: jest
      .fn()
      .mockImplementation(() => ({ createUser: mockCreateUser, getUser: mockGetUser })),
    User: jest.fn().mockImplementation(() => ({ updateUser: updateUser })),
    PaymentsUser: jest.fn().mockImplementation(() => ({ updateUser: updateUser })),
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
  jest.clearAllMocks();
  user = await createUser({ email: 'test@example.com' });
  headers = { Authorization: `Bearer ${generateToken(user)}` };
  mockParams = createMockBasicKycParams(user);
});

afterEach(async () => {
  await clearAllData();
  jest.clearAllMocks();
});

async function createFboAccount(returnedUser): Promise<void> {
  mockCreateUser.mockResolvedValueOnce(returnedUser);
  await request(app.getHttpServer())
    .post(`/v1/payments/kyc`)
    .set(headers)
    .send(mockParams)
    .expect(HttpStatus.CREATED)
    .expect(({ body }) => {
      expect(body.status).toBe(HttpStatus.CREATED);
    });
  // return;
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

  test('should return NOT FOUND error if FBO account does not exist ', async () => {
    mockGetUser.mockImplementationOnce(() => {
      return Promise.reject(
        new HttpException({ status: HttpStatus.NOT_FOUND }, HttpStatus.NOT_FOUND),
      );
    });
    mockCreateUser.mockResolvedValueOnce(paymentsAccountCreationSuccess.User);
    await request(app.getHttpServer())
      .post(`/v1/payments/kyc`)
      .set(headers)
      .send(mockParams)
      .expect(HttpStatus.CREATED)
      .expect(({ body }) => {
        expect(body.status).toBe(HttpStatus.CREATED);
      });
    // await createFboAccount(paymentsAccountCreationSuccess.User);

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
    mockGetUser.mockResolvedValueOnce({ body: { bob: undefined } });
    const mockParams = createMockBasicKycParams(user);

    await createFboAccount(paymentsAccountCreationSuccess.User);

    await request(app.getHttpServer())
      .post(`/v1/payments/update-kyc`)
      .set(headers)
      .send(mockParams)
      .expect(HttpStatus.BAD_REQUEST)
      .expect(({ body }) => {
        expect(body.status).toBe(HttpStatus.BAD_REQUEST);
        expect(body.message).toBe('Could not find document to update');
      });
  });

  test('should throw BAD REQUEST if patch fails', async () => {
    mockGetUser.mockResolvedValueOnce({ body: { documents: [{ id: 1 }] }, updateUser });
    updateUser.mockImplementation(() => {
      return Promise.reject(
        new HttpException({ status: HttpStatus.NOT_FOUND }, HttpStatus.NOT_FOUND),
      );
    });
    const mockParams = createMockBasicKycParams(user);
    mockCreateUser.mockResolvedValueOnce(paymentsAccountCreationSuccess.User);
    await request(app.getHttpServer())
      .post(`/v1/payments/kyc`)
      .set(headers)
      .send(mockParams)
      .expect(HttpStatus.CREATED)
      .expect(({ body }) => {
        expect(body.status).toBe(HttpStatus.CREATED);
      });
    // await createFboAccount(paymentsAccountCreationSuccess.User);

    await request(app.getHttpServer())
      .post(`/v1/payments/update-kyc`)
      .set(headers)
      .send(mockParams)
      .expect(HttpStatus.BAD_REQUEST)
      .expect(({ body }) => {
        expect(body.status).toBe(HttpStatus.BAD_REQUEST);
        expect(body.error).toBe('Could not patch user payment account');
      });
  });

  test('should return 200 on succesful kyc update', async () => {
    mockGetUser.mockResolvedValueOnce({ body: { documents: [{ id: 1 }] }, updateUser });
    updateUser.mockResolvedValueOnce({ body: { status: HttpStatus.OK } });

    await createFboAccount(paymentsAccountCreationSuccess.User);

    await request(app.getHttpServer())
      .post(`/v1/payments/update-kyc`)
      .set(headers)
      .send(mockParams)
      .expect(HttpStatus.OK)
      .expect(({ body }) => {
        expect(body.status).toBe(HttpStatus.OK);
        expect(body.msg).toBe(`Payments account updated for user -- ${user.id}`);
      });
  });

  test('should return INTERNAL ERROR if some unkown error gets thrown', async () => {
    mockGetUser.mockResolvedValueOnce({ body: { documents: [{ id: 1 }] }, updateUser });
    updateUser.mockResolvedValueOnce(null);

    await createFboAccount(paymentsAccountCreationSuccess.User);

    await request(app.getHttpServer())
      .post(`/v1/payments/update-kyc`)
      .set(headers)
      .send(mockParams)
      .expect(HttpStatus.BAD_REQUEST)
      .expect(({ body }) => {
        expect(body.status).toBe(HttpStatus.BAD_REQUEST);
        expect(body.message).toBe('Something went wrong');
      });
  });
});
