import { INestApplication } from '@nestjs/common';
import { SynapseService } from 'modules/synapse/providers/synapse.service';
import { createApp } from '../utils/app.utils';
import { AddressVerificationFailedException } from 'modules/synapse/exceptions/address-verification-failed.exception';
import { User } from 'modules/users/entities';
import { createUser } from '../utils/create-user';
import { DateOfBirthDto } from 'modules/synapse/dto/date-of-birth.dto';
import { VerifyAddressDto } from 'modules/synapse/dto/verify-address.dto';
import { SynapseAccountCreationFailed } from 'modules/synapse/exceptions/account-creation-failure.exception';

let app: INestApplication;
let service: SynapseService;
let user: User;

// const mockProviders = [
//   {
//     provide: SynapseService,
//     // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
//     useValue: { createSynapseUserAccount: () => account201 },
//   },
// ];
beforeAll(async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app = await createApp();
  user = await createUser({ email: 'test@example.com' });
});
beforeEach(async () => {
  service = app.get<SynapseService>(SynapseService);
});
afterEach(async () => {
  jest.clearAllMocks();
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
    test('should throw error on error', async () => {
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
    //  test('should ', async () => {  })
    test.todo;
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
            email: 'testMcTestFace@example.com',
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
          message: 'Client credentials are missing from the request.',
        });
        expect(error).toBeInstanceOf(SynapseAccountCreationFailed);
        return;
      }

      throw new Error('Error did not throw');
    });
  });
});
