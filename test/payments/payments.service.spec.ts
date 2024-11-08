/* eslint-disable no-magic-numbers */
import { HttpException, HttpStatus, INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '../utils/app.utils';
import { AddressVerificationFailedException } from 'modules/payments/exceptions/address-verification-failed.exception';
import { User } from 'modules/users/entities';
import { createUser } from '../utils/create-user';
import { DateOfBirthDto } from 'modules/payments/dto/date-of-birth.dto';
import { VerifyAddressDto } from 'modules/payments/dto/verify-address.dto';
import { PaymentsAccountCreationFailed } from 'modules/payments/exceptions/account-creation-failure.exception';
import { UserPaymentsAccountNotFound as UserPaymentsAccountNotFound } from 'modules/payments/exceptions/user-account-verification-failed.exception';
import { PaymentsService } from 'modules/payments/providers/payments.service';
import {
  mockUserPaymentAccount,
  paymentsAccountCreationSuccess,
} from 'modules/payments/test-variables';
import {
  IAgreementType,
  IPaymentsAccountResponse,
} from 'modules/payments/interfaces/create-account';
import { IPermissionCodes } from 'modules/payments/interfaces/synapse-node';
import { AccountPatchError } from 'modules/payments/exceptions/account-patch-failure.exception';
import { BaseDocumentError } from 'modules/payments/exceptions/base-document-error-exception';
import { UserNotFoundException } from 'modules/common/exceptions/user-not-found.exception';

let app: INestApplication;
let service: PaymentsService;
let user: User;
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

const realAddress = {
  address_street: '1 Market St.',
  address_city: 'SF',
  address_subdivision: 'CA',
  address_postal_code: '94105',
  address_country_code: 'US',
};

const realBirthday = {
  day: 1,
  month: 1,
  year: 1990,
};

const createGenericKycAccount = async (): Promise<IPaymentsAccountResponse> => {
  return await service.createPaymentsAccount(
    {
      first_name: 'test',
      last_name: 'mcTestFace',
      email: user.email,
      phone_numbers: '123-123-1344',
      mailing_address: realAddress,
      date_of_birth: realBirthday,
      gender: 'F',
    },
    user,
    {},
    '0.0.0.0',
  );
};

const synapseStyledError = (status: HttpStatus, msg?: string) => {
  return new HttpException(
    {
      status: status,
      data: {
        error: {
          en: msg ?? 'test error',
        },
      },
    },
    status,
  );
};

beforeAll(async () => {
  app = await createApp();
});
beforeEach(async () => {
  service = app.get<PaymentsService>(PaymentsService);
  user = await createUser({
    email: 'test@example.com',
  });
});
afterEach(async () => {
  jest.clearAllMocks();
  await clearAllData();
});

afterAll(async () => {
  await app.close();
});

describe('Service', () => {
  describe('verifyAddress', () => {
    test('should first verify address', async () => {
      mockVerifyAddress.mockResolvedValue({
        data: {
          deliverability: 'deliverable_missing_unit',
          deliverability_analysis: {
            partial_valid: true,
            primary_number_invalid: false,
            primary_number_missing: false,
            secondary_invalid: false,
            secondary_missing: true,
          },
          normalized_address: {
            address_city: 'SAN FRANCISCO',
            address_country_code: 'US',
            address_postal_code: '94105',
            address_street: '1 MARKET ST',
            address_subdivision: 'CA',
          },
        },
      });
      const address = await service.verifyAddress({
        address_street: '1 Market St.',
        address_city: 'SF',
        address_subdivision: 'CA',
        address_postal_code: '94105',
        address_country_code: 'US',
      });
      expect(address).toMatchObject({
        deliverability: 'deliverable_missing_unit',
        deliverability_analysis: {
          partial_valid: true,
          primary_number_invalid: false,
          primary_number_missing: false,
          secondary_invalid: false,
          secondary_missing: true,
        },
        normalized_address: {
          address_city: 'SAN FRANCISCO',
          address_country_code: 'US',
          address_postal_code: '94105',
          address_street: '1 MARKET ST',
          address_subdivision: 'CA',
        },
      });
    });

    test('should first verify address', async () => {
      mockVerifyAddress.mockResolvedValue({
        data: {
          deliverability: 'error',
          deliverability_analysis: {
            partial_valid: false,
            primary_number_invalid: false,
            primary_number_missing: false,
            secondary_invalid: false,
            secondary_missing: false,
          },
          normalized_address: {},
        },
      });
      const address = await service.verifyAddress({
        address_street: 'TEST',
        address_city: 'TEST',
        address_subdivision: '',
        address_postal_code: '',
        address_country_code: '',
      });
      expect(address).toMatchObject({
        deliverability: 'error',
        deliverability_analysis: {
          partial_valid: false,
          primary_number_invalid: false,
          primary_number_missing: false,
          secondary_invalid: false,
          secondary_missing: false,
        },
        normalized_address: {},
      });
    });
    test('should throw error on if something is missing.', async () => {
      mockVerifyAddress.mockImplementation(() => {
        return Promise.reject(new Error(''));
      });
      try {
        await service.verifyAddress({
          address_street: '',
          address_city: '',
          address_subdivision: '',
          address_postal_code: '',
          address_country_code: '',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(AddressVerificationFailedException);
        return;
      }
      throw new Error('Error did not throw');
    });
  });

  describe('getUserDetails', () => {
    test('should throw error if no local payment account exists', async () => {
      try {
        await service.getPaymentAccountDetails(user);
      } catch (error) {
        expect(error).toBeInstanceOf(UserPaymentsAccountNotFound);
        expect(error.response).toMatchObject({
          error: 'Payments Account Not Found',
          message: `There is no saved payments account associated with the user ID -- ${user.id}`,
          status: 404,
        });
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should throw if no payments account exists', async () => {
      mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
      mockCreateNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      await createGenericKycAccount();
      mockGetUser.mockImplementation(() => {
        return Promise.reject(synapseStyledError(HttpStatus.BAD_REQUEST));
      });

      try {
        await service.getPaymentAccountDetails(user);
      } catch (error) {
        expect(error).toBeInstanceOf(UserPaymentsAccountNotFound);
        expect(error.response.error).toBe('Payments Account Not Found');
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should return payments account data ', async () => {
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      mockGetUser.mockResolvedValue({ body: paymentsAccountCreationSuccess });
      mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
      mockCreateNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
      await createGenericKycAccount();
      const userDetails = await service.getPaymentAccountDetails(user);
      expect(userDetails.status).toEqual(HttpStatus.OK);
    });
  });

  describe('createPaymentsAccount', () => {
    test('should throw an error if account is missing credentials', async () => {
      mockCreateUser.mockImplementation(() => {
        return Promise.reject(synapseStyledError(HttpStatus.BAD_REQUEST));
      });

      const blankMailingAddress = new VerifyAddressDto();
      const blankDateOfBirth = new DateOfBirthDto();
      try {
        await service.createPaymentsAccount(
          {
            first_name: 'test',
            last_name: 'mcTestFace',
            email: '',
            phone_numbers: '123-123-1344',
            mailing_address: blankMailingAddress,
            date_of_birth: blankDateOfBirth,
          },
          user,
          {},
          '0.0.0.0',
        );
      } catch (error) {
        expect(error.response).toMatchObject({
          statusCode: 400,
          error: 'Could not create user payments account',
          message: 'test error',
        });
        expect(error).toBeInstanceOf(PaymentsAccountCreationFailed);
        return;
      }

      throw new Error('Error did not throw');
    });

    test('should successfully create an account for a new user', async () => {
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      mockGetUser.mockResolvedValue({ body: { documents: [{ id: 1 }] }, updateUser });
      mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
      mockCreateNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
      mockGrabRefreshToken.mockResolvedValue('asdfa');
      const account = await createGenericKycAccount();
      expect(account.account.userId).toEqual(user.id);
      expect(account.account.depositNodeId).toBeDefined();
      expect(account.msg).toEqual(`Payments account created for user -- ${user.id}`);
      expect(account.status).toBe(HttpStatus.CREATED);
    });

    test('should fail if user already exists', async () => {
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      mockGetUser.mockResolvedValue({ body: paymentsAccountCreationSuccess });
      // Create the user
      await createGenericKycAccount();
      // try to recreate the existing user
      const account = await createGenericKycAccount();
      expect(account.msg).toEqual(`Payments account already exists for user -- ${user.id}`);
    });
  });

  describe('createPaymentNodeAccount', () => {
    test('should throw if no account is made', async () => {
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      mockGetUser.mockResolvedValue({ body: { documents: [{ id: 1 }] }, updateUser });
      mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
      mockCreateNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
      mockGrabRefreshToken.mockResolvedValue('asdfa');
      await expect(
        async () =>
          await service.createPaymentNodeAccount(
            {
              mailing_address: realAddress,
            },
            user,
            {},
            '0.0.0.0',
          ),
      ).rejects.toThrow(new UserNotFoundException());
    });

    test('should throw if patching the synapse account fails', async () => {
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      mockGetUser.mockResolvedValue({ body: { documents: [{ id: 1 }] }, updateUser });
      updateUser.mockResolvedValue({
        status: HttpStatus.BAD_REQUEST,
        body: { status: HttpStatus.BAD_REQUEST },
      });
      mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
      mockCreateNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
      mockGrabRefreshToken.mockResolvedValue('asdfa');
      await createGenericKycAccount();
      await expect(
        async () =>
          await service.createPaymentNodeAccount(
            {
              mailing_address: realAddress,
            },
            user,
            {},
            '0.0.0.0',
          ),
      ).rejects.toThrow(new AccountPatchError({ error: { en: 'Something went wrong', code: '' } }));
    });

    test('should successfully create synapse node', async () => {
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      mockGetUser.mockResolvedValue({ body: { documents: [{ id: 1 }] }, updateUser });
      mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
      mockCreateNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
      updateUser.mockResolvedValueOnce({ status: HttpStatus.OK, body: { status: HttpStatus.OK } });
      mockGrabRefreshToken.mockResolvedValue('token');
      await createGenericKycAccount();
      const account = await service.createPaymentNodeAccount(
        {
          mailing_address: realAddress,
        },
        user,
        {},
        '0.0.0.0',
      );
      expect(mockGrabRefreshToken).toBeCalledTimes(1);
      expect(mockOauthUser).toBeCalledTimes(1);
      expect(mockCreateNode).toBeCalledTimes(1);
      expect(account.status).toBe(HttpStatus.CREATED);
      expect(account.msg).toBe(`Payments account created for user -- ${user.id}`);
    });
  });

  describe('updateUserPermissions', () => {
    test('should update the users permissions', async () => {
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      mockGetUser.mockResolvedValue({ body: paymentsAccountCreationSuccess, updateUser });
      updateUser.mockResolvedValueOnce({ status: HttpStatus.OK, body: { status: HttpStatus.OK } });
      await createGenericKycAccount();
      const result = await service.updateUserPermission(user, 'VERIFIED', 'USER_REQUEST');
      expect(result).toMatchObject({
        status: HttpStatus.OK,
        message: 'Updated user permissions',
      });
    });

    test('should throw error if incorect permission is set', async () => {
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      mockGetUser.mockResolvedValue({ body: paymentsAccountCreationSuccess, updateUser });
      updateUser.mockImplementation(() => {
        return Promise.reject(
          synapseStyledError(
            HttpStatus.BAD_REQUEST,
            "'FAKE_VALUE' is not one of ..Failed validating 'enum' in schema['properties']['permission_code']:",
          ),
        );
      });
      await createGenericKycAccount();
      await expect(async () => {
        await service.updateUserPermission(user, 'VERIFIED', 'FAKE_VALUE' as IPermissionCodes);
      }).rejects.toThrow(
        new AccountPatchError({
          error: {
            en: "'FAKE_VALUE' is not one of ..Failed validating 'enum' in schema['properties']['permission_code']:",
            code: '',
          },
        }),
      );
    });
  });

  describe('closeUser', () => {
    test('should update a user to closed', async () => {
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      mockGetUser.mockResolvedValue({ body: paymentsAccountCreationSuccess, updateUser });
      updateUser.mockResolvedValueOnce({ status: HttpStatus.OK, body: { status: HttpStatus.OK } });

      await createGenericKycAccount();
      const result = await service.closeUser(user);
      expect(result).toMatchObject({
        status: HttpStatus.OK,
        message: 'Updated user permissions',
      });
    });
  });

  describe('getAgreementPreview', () => {
    test('should throw error if no base documents are found.', async () => {
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      mockGetUser.mockResolvedValue({ body: paymentsAccountCreationSuccess, updateUser });
      mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
      mockCreateNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
      updateUser.mockResolvedValueOnce({ status: HttpStatus.OK, body: { status: HttpStatus.OK } });

      await createGenericKycAccount();
      await expect(async () => {
        await service.getAgreementPreview(user);
      }).rejects.toThrow(BaseDocumentError);
    });

    test('should throw if no agreement(s) are found', async () => {
      const createNode = jest.fn();
      createNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
      mockCreateNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
      mockGetUser.mockResolvedValue({ body: { documents: [{ id: 1 }] }, updateUser, createNode });

      await createGenericKycAccount();
      await expect(async () => {
        await service.getAgreementPreview(user);
      }).rejects.toThrow(new Error('No agreement'));
    });

    test('should throw if no agreement(s) are found', async () => {
      const createNode = jest.fn();
      createNode.mockResolvedValue({
        data: { success: true, node_count: 0, nodes: [{ _id: '3', node_count: 0 }] },
      });
      mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
      mockCreateNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
      mockGetUser.mockResolvedValue({ body: { documents: [{ id: 1 }] }, updateUser, createNode });

      await createGenericKycAccount();
      await expect(async () => {
        await service.getAgreementPreview(user);
      }).rejects.toThrow(new Error('No agreement'));
    });

    test('should return agreement forms', async () => {
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

      await createGenericKycAccount();

      await service.getAgreementPreview(user);
    });
  });

  describe('saveAgreementAcknowledge', () => {
    test('should save user agreement acknowledgement', async () => {
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      mockGetUser.mockResolvedValue({ body: mockUserPaymentAccount });
      mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
      mockCreateNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
      await createGenericKycAccount();

      const response = await service.saveAgreementAcknowledgement(user, 'NODE_AGREEMENT');
      expect(response).toMatchObject({
        status: HttpStatus.OK,
      });
    });

    test('should throw if the agreementStatus is not ACCEPTED or DECLINED', async () => {
      mockCreateUser.mockResolvedValue(paymentsAccountCreationSuccess.User);
      mockGetUser.mockResolvedValue({ body: mockUserPaymentAccount });
      mockOauthUser.mockResolvedValue({ expires_at: new Date().getTime() });
      mockCreateNode.mockResolvedValue({ data: { success: true, nodes: [{ _id: '3' }] } });
      await createGenericKycAccount();

      await expect(async () => {
        await service.saveAgreementAcknowledgement(user, 'SOMETEXT' as IAgreementType);
      }).rejects.toThrow(new Error('Incorrect agreement'));
    });
  });
});
