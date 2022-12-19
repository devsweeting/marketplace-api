import { HttpStatus, INestApplication } from '@nestjs/common';
import { BasicKycDto } from 'modules/payments/dto/basic-kyc.dto';
import { createApp } from '../utils/app.utils';
import { PaymentsController } from 'modules/payments/controllers/payments.controller';
import { PaymentsService } from 'modules/payments/providers/payments.service';
import {
  mockBasicKycQuery,
  paymentsAccountCreationSuccess,
  synapseNewDepositAccountSuccess,
} from 'modules/payments/test-variables';
import { createUser } from '../utils/create-user';
import { User } from 'modules/users/entities';
let app: INestApplication;
let paymentsController: PaymentsController;
let paymentsService: PaymentsService;

const realAddress = {
  address_street: '1 Market St.',
  address_city: 'SF',
  address_subdivision: 'CA',
  address_postal_code: '94105',
  address_country_code: 'US',
};
const mockBasicKyc: BasicKycDto = mockBasicKycQuery;

let user: User;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockVerifyAddress = jest.fn();
const mockCreateUser = jest.fn();
const mockGetUser = jest.fn();
const updateUser = jest.fn();
const mockOauthUser = jest.fn();
const mockCreateNode = jest.fn();
const mockGrabRefreshToken = jest.fn();

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
      _grabRefreshToken: mockGrabRefreshToken,
      createNode: mockCreateNode,
    })),
  };
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
    mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
    mockCreateNode.mockResolvedValue({
      data: synapseNewDepositAccountSuccess,
    });
    mockCreateUser.mockResolvedValueOnce(paymentsAccountCreationSuccess.User);
    mockGetUser.mockResolvedValueOnce({ body: paymentsAccountCreationSuccess });

    const response = await paymentsController.createBasePaymentUser(
      {} as any,
      '::ffff:172.18.0.1',
      mockBasicKyc,
      user,
    );

    expect(response.msg).toEqual(`Payments account created for user -- ${user.id}`);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.account).toBeDefined();
    expect(response.account.userId).toBe(user.id);
    expect(response.account.depositNodeId).toBeDefined();
    expect(response.account.oauthKeyExpiresAt).toBeDefined();
  });

  test('should create node account', async () => {
    mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
    mockGetUser.mockResolvedValue({ body: { documents: [{ id: 1 }] }, updateUser });
    mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
    mockCreateNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
    updateUser.mockResolvedValueOnce({ status: HttpStatus.OK, body: { status: HttpStatus.OK } });
    mockGrabRefreshToken.mockResolvedValue('token');
    await paymentsController.createBasePaymentUser(
      {} as any,
      '::ffff:172.18.0.1',
      mockBasicKyc,
      user,
    );

    const response = await paymentsController.createPaymentNode(
      {} as any,
      '::ffff:172.18.0.1',
      {
        mailing_address: realAddress,
      },
      user,
    );
    console.log(response);
    expect(response.msg).toEqual(`Payments account created for user -- ${user.id}`);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.account).toBeDefined();
    expect(response.account.userId).toBe(user.id);
    expect(response.account.depositNodeId).toBeDefined();
    expect(response.account.oauthKeyExpiresAt).toBeDefined();
  });

  test('Should return the users account if it already exists', async () => {
    mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
    mockCreateNode.mockResolvedValue({
      data: synapseNewDepositAccountSuccess,
    });
    mockCreateUser.mockResolvedValueOnce(paymentsAccountCreationSuccess.User);
    mockGetUser.mockResolvedValueOnce({ body: paymentsAccountCreationSuccess });
    await paymentsController.createBasePaymentUser(
      {} as any,
      '::ffff:172.18.0.1',
      mockBasicKyc,
      user,
    );
    const response = await paymentsController.createBasePaymentUser(
      {} as any,
      '::ffff:172.18.0.1',
      mockBasicKyc,
      user,
    );

    expect(response.msg).toEqual(`Payments account already exists for user -- ${user.id}`);
    expect(response.status).toBe(HttpStatus.SEE_OTHER);
    expect(response.account).toBeDefined();
    expect(response.account.userId).toBe(user.id);
    expect(response.account.depositNodeId).toBeDefined();
  });
});
