import { HttpStatus, INestApplication } from '@nestjs/common';
import { BasicKycDto } from 'modules/payments/dto/basic-kyc.dto';
import { createApp } from '../utils/app.utils';
import { PaymentsController } from 'modules/payments/controllers/payments.controller';
import { PaymentsService } from 'modules/payments/providers/payments.service';
import { mockBasicKycQuery } from 'modules/payments/test-variables';
import { createUser } from '../utils/create-user';
import { User } from 'modules/users/entities';
import { generateToken } from '../utils/jwt.utils';
let app: INestApplication;
let paymentsController: PaymentsController;
let paymentsService: PaymentsService;
const mockBasicKyc: BasicKycDto = mockBasicKycQuery;
let user: User;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let headers: Record<string, string>;

beforeEach(async () => {
  headers = { Authorization: `Bearer ${generateToken(user)}` };
});

afterAll(async () => {
  await app.close();
  jest.clearAllMocks();
});

describe('Payments Controller', () => {
  beforeAll(async () => {
    jest.clearAllMocks();
    app = await createApp();
    user = await createUser({ email: 'test@example.com' });

    paymentsService = app.get<PaymentsService>(PaymentsService);
    paymentsController = app.get<PaymentsController>(PaymentsController);
  });

  it('Payment mocks should be defined', () => {
    expect(paymentsService).toBeDefined();
    expect(paymentsController).toBeDefined();
  });

  test('Should create a new user account', async () => {
    const response = await paymentsController.createUser(mockBasicKyc, user, '::ffff:172.18.0.1');
    expect(response.msg).toEqual(`Payments account created for user -- ${user.id}`);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.account).toBeDefined();
    expect(response.account.userId).toBe(user.id);
  });

  test('Should return the users account if it already exists', async () => {
    await paymentsController.createUser(mockBasicKyc, user, '::ffff:172.18.0.1');
    const response = await paymentsController.createUser(mockBasicKyc, user, '::ffff:172.18.0.1');
    expect(response.msg).toEqual(`Payments account already exists for user -- ${user.id}`);
    expect(response.status).toBe(HttpStatus.SEE_OTHER);
    expect(response.account).toBeDefined();
    expect(response.account.userId).toBe(user.id);
  });
});
