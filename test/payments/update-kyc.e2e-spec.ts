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
import { UserPaymentsAccountNotFound } from 'modules/payments/exceptions/user-account-verification-failed.exception';
let app: INestApplication;
let paymentsController: PaymentsController;
let paymentsService: PaymentsService;
const mockBasicKyc: BasicKycDto = mockBasicKycQuery;
let user: User;
let userWithNoAccount: User;
let headers;
const mockClient = jest.createMockFromModule<typeof import('synapsenode')>('synapsenode');
beforeAll(async () => {
  app = await createApp();
});

beforeEach(async () => {
  headers = { Authorization: `Bearer ${generateToken(user)}` };
});

afterAll(async () => {
  await app.close();
  jest.clearAllMocks();
});

describe('Payments Controller', () => {
  describe('mock payment provider API', () => {
    beforeAll(async () => {
      user = await createUser({ email: 'test@example.com' });

      paymentsService = app.get<PaymentsService>(PaymentsService);
      paymentsController = app.get<PaymentsController>(PaymentsController);
    });

    it('Payment mocks should be defined', () => {
      expect(paymentsService).toBeDefined();
      expect(paymentsController).toBeDefined();
    });

    test('should throw erorr if no payment account exists', async () => {
      const mockParams = createMockBasicKycParams(user);
      await request(app.getHttpServer())
        .post(`/v1/payments/update-kyc`)
        .set(headers)
        .send(mockParams)
        .expect(HttpStatus.NOT_FOUND)
        .expect(({ body }) => {
          expect(body.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    test('should throw error if address is not complete', async () => {
      test.todo;
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
});
