import { HttpStatus, INestApplication } from '@nestjs/common';
import { SynapseService } from 'modules/synapse/providers/synapse.service';
import { clearAllData, createApp } from '../utils/app.utils';
import { AddressVerificationFailedException } from 'modules/synapse/exceptions/address-verification-failed.exception';
import { User } from 'modules/users/entities';
import { createUser } from '../utils/create-user';
import { DateOfBirthDto } from 'modules/synapse/dto/date-of-birth.dto';
import { VerifyAddressDto } from 'modules/synapse/dto/verify-address.dto';
import { SynapseAccountCreationFailed } from 'modules/synapse/exceptions/account-creation-failure.exception';
import { UserSynapseAccountNotFound } from 'modules/synapse/exceptions/user-account-verification-failed.exception';

let app: INestApplication;
let service: SynapseService;
let user: User;
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

beforeAll(async () => {
  app = await createApp();
});
beforeEach(async () => {
  service = app.get<SynapseService>(SynapseService);
  user = await createUser({
    email: 'test@example.com',
  });
});
afterEach(async () => {
  jest.clearAllMocks();
  await clearAllData();
});
describe('Service', () => {
  describe('verifyAddress', () => {
    test('should first verify address', async () => {
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
        await service.getSynapseUserDetails(user);
      } catch (error) {
        expect(error).toBeInstanceOf(UserSynapseAccountNotFound);
        expect(error.response).toMatchObject({
          error: 'Payments Account Not Found',
          message: `There is no saved payments account associated with the user ID -- ${user.id}`,
          status: 404,
        });
        return;
      }
      throw new Error('Error did not throw');
    });

    test('should throw if no synapse payment account exists', async () => {
      // This tests requires a synapse account to exist locally but not have one externally,
      // resulting in a Not found error from synapse
      test.todo;
    });

    test('should return synapse data ', async () => {
      await service.createSynapseUserAccount(
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
        '0.0.0.0',
      );
      const userDetails = await service.getSynapseUserDetails(user);
      expect(userDetails.status).toEqual(HttpStatus.OK);
      //TODO possibly add more expect() to ensure that the data is returned exactly as we suspect
    });
  });

  describe('createUserAccount', () => {
    test('should throw an error if account is missing credentials', async () => {
      const blankMailingAddress = new VerifyAddressDto();
      const blankDateOfBirth = new DateOfBirthDto();
      try {
        await service.createSynapseUserAccount(
          {
            first_name: 'test',
            last_name: 'mcTestFace',
            email: '',
            phone_numbers: '123-123-1344',
            mailing_address: blankMailingAddress,
            date_of_birth: blankDateOfBirth,
          },
          user,
          '0.0.0.0',
        );
      } catch (error) {
        expect(error.response).toMatchObject({
          statusCode: 400,
          error: 'Couldnt create user Synapse account',
          message:
            "'' does not match \"^[a-zA-Z0-9!#$%&'*+-/=?^_`{|}~.@]{3,120}$\"..Failed validating 'pattern' in schema['properties']['logins']['items']['properties']['email']:",
        });
        expect(error).toBeInstanceOf(SynapseAccountCreationFailed);
        return;
      }

      throw new Error('Error did not throw');
    });

    test('should successfully create an account for a new user', async () => {
      const account = await service.createSynapseUserAccount(
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
        '0.0.0.0',
      );
      expect(account.account.userId).toEqual(user.id);
      expect(account.msg).toEqual(`Synapse account created for user -- ${user.id}`);
    });

    test('should fail if user already exists', async () => {
      // Create the user
      await service.createSynapseUserAccount(
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
        '0.0.0.0',
      );
      // try to recreate the existing user
      const account = await service.createSynapseUserAccount(
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
        '0.0.0.0',
      );
      expect(account.msg).toEqual(`Synapse account already exists for user -- ${user.id}`);
    });
  });
});
