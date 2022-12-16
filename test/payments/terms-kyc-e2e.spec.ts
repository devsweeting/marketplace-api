import { HttpStatus, INestApplication } from '@nestjs/common';
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

const mockVerifyAddress = jest.fn();
const mockCreateUser = jest.fn();
const mockGetUser = jest.fn();
const updateUser = jest.fn();
const mockOauthUser = jest.fn();
const mockCreateNode = jest.fn();
jest.mock('synapsenode', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      createUser: mockCreateUser,
      getUser: mockGetUser,
      verifyAddress: mockVerifyAddress,
    })),
    User: jest.fn().mockImplementation(() => ({
      updateUser: updateUser,
      _oauthUser: mockOauthUser,
      createNode: mockCreateNode,
    })),
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
  mockParams = { agreement_type: 'TERMS_AND_CONDITIONS' };
});

afterEach(async () => {
  await clearAllData();
  jest.clearAllMocks();
});

async function createFboAccount(returnedUser): Promise<void> {
  mockCreateUser.mockResolvedValueOnce(returnedUser);
  await request(app.getHttpServer())
    .post(`/v1/payments/account`)
    .set(headers)
    .send(createMockBasicKycParams(user))
    .expect(HttpStatus.CREATED)
    .expect(({ body }) => {
      expect(body.status).toBe(HttpStatus.CREATED);
    });
}

describe('Terms and Conditions', () => {
  describe('GET', () => {
    test('should return agreements', async () => {
      const createNode = jest.fn();
      createNode.mockResolvedValue({
        data: {
          success: true,
          node_count: 1,
          nodes: [{ info: { agreements: { type: 'NODE_AGREEMENT', url: 'string' } } }],
        },
      });
      mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
      mockCreateNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
      mockGetUser.mockResolvedValue({ body: { documents: [{ id: 1 }] }, updateUser, createNode });
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      await createFboAccount(paymentsAccountCreationSuccess.User);

      await request(app.getHttpServer())
        .get(`/v1/payments/terms`)
        .set(headers)
        .send(mockParams)
        // .expect(HttpStatus.OK)
        .expect(({ body }) => {
          console.log(body);
          expect(body.status).toBe(HttpStatus.OK);
          expect(body.agreements).toMatchObject({ type: 'NODE_AGREEMENT', url: 'string' });
        });
    });

    test('should return BAD REQUEST if user does not have a base document', async () => {
      const createNode = jest.fn();
      createNode.mockResolvedValue({
        data: {
          success: true,
          node_count: 1,
          nodes: [{ info: { agreements: { type: 'NODE_AGREEMENT', url: 'string' } } }],
        },
      });
      mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
      mockCreateNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
      mockGetUser.mockResolvedValue({ body: {}, updateUser, createNode });
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      await createFboAccount(paymentsAccountCreationSuccess.User);

      await request(app.getHttpServer())
        .get(`/v1/payments/terms`)
        .set(headers)
        .send(mockParams)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body.status).toBe(HttpStatus.BAD_REQUEST);
          expect(body.message).toBe('Could not find document to update');
        });
    });

    test('should return BAD REQUEST if no agreements are found', async () => {
      const createNode = jest.fn();
      createNode.mockResolvedValue({
        data: {
          success: true,
          node_count: 1,
          nodes: [{ info: {} }],
        },
      });
      mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
      mockCreateNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
      mockGetUser.mockResolvedValue({ body: { documents: [{ id: 1 }] }, updateUser, createNode });
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      await createFboAccount(paymentsAccountCreationSuccess.User);

      await request(app.getHttpServer())
        .get(`/v1/payments/terms`)
        .set(headers)
        .send(mockParams)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body.status).toBe(HttpStatus.BAD_REQUEST);
          expect(body.message).toBe('No agreement found');
        });
    });
  });
  describe('POST', () => {
    test('should return agreements', async () => {
      const createNode = jest.fn();
      createNode.mockResolvedValue({
        data: {
          success: true,
          node_count: 1,
          nodes: [{ info: { agreements: { type: 'NODE_AGREEMENT', url: 'string' } } }],
        },
      });
      mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
      mockCreateNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
      mockGetUser.mockResolvedValue({ body: { documents: [{ id: 1 }] }, updateUser, createNode });
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      await createFboAccount(paymentsAccountCreationSuccess.User);

      await request(app.getHttpServer())
        .post(`/v1/payments/terms`)
        .set(headers)
        .send(mockParams)
        // .expect(HttpStatus.OK)
        .expect(({ body }) => {
          console.log(body);
          expect(body.status).toBe(HttpStatus.OK);
          expect(body.message).toBe('User agreement updated');
        });
    });

    test('should return BAD REQUEST if agreementStatus is not TERMS_AND_CONDITIONS or NODE_AGREEMENT', async () => {
      const createNode = jest.fn();
      createNode.mockResolvedValue({
        data: {
          success: true,
          node_count: 1,
          nodes: [{ info: { agreements: { type: 'NODE_AGREEMENT', url: 'string' } } }],
        },
      });
      mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
      mockCreateNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
      mockGetUser.mockResolvedValue({ body: { documents: [{ id: 1 }] }, updateUser, createNode });
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      await createFboAccount(paymentsAccountCreationSuccess.User);

      await request(app.getHttpServer())
        .post(`/v1/payments/terms`)
        .set(headers)
        .send({ agreement_type: 'bad request' })
        .expect(HttpStatus.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body.status).toBe(HttpStatus.BAD_REQUEST);
          expect(body.message).toBe('Incorrect agreement');
        });
    });
  });
});
