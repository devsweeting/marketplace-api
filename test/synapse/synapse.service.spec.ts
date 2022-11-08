import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from 'aws-sdk';
import { CreateAccountDto } from 'modules/synapse/dto/create-account.dto';
import { SynapseService } from 'modules/synapse/providers/synapse.service';
import { createApp } from '../utils/app.utils';
import { account201, account303, mockCreateAccountQuery } from 'modules/synapse/test-variables';
import { AddressVerificationFailedException } from 'modules/synapse/exceptions/address-verification-failed.exception';

let app: INestApplication;
let service: SynapseService;

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
});
beforeEach(async () => {
  service = app.get<SynapseService>(SynapseService);
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
});
