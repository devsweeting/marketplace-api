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

    test('should throw erorr if no payment account has been made', async () => {
      test.todo;
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
