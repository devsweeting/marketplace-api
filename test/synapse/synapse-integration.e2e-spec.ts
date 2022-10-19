import { INestApplication } from '@nestjs/common';
import { VerifyAddressDto } from 'modules/synapse/dto/verify-address.dto';
import request from 'supertest';
import { createApp } from '../utils/app.utils';

describe('Synapse Integration', () => {
  let app: INestApplication;
  let mockRequest: VerifyAddressDto;

  beforeAll(async () => {
    mockRequest = {
      address_street: '170 St Germain St',
      address_city: 'SF',
      address_subdivision: 'CA',
      address_country_code: 'US',
      address_postal_code: '94404',
    };
    app = await createApp();
  });

  test('should verify an address is correct', () => {
    return request(app.getHttpServer()).post(`/v1/synapse/address`).send(mockRequest).expect(200);
  });
});
