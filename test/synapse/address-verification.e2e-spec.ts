import { INestApplication } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import { VerifyAddressDto } from 'modules/synapse/dto/verify-address.dto';
import request from 'supertest';
import { createApp } from '../utils/app.utils';

describe('Verify address with Synapse', () => {
  let app: INestApplication;
  let mockRequest: VerifyAddressDto;

  beforeAll(async () => {
    app = await createApp();
  });

  test('should verify an address is correct', () => {
    mockRequest = {
      address_street: '170 St Germain St',
      address_city: 'SF',
      address_subdivision: 'CA',
      address_country_code: 'US',
      address_postal_code: '94404',
    };
    return request(app.getHttpServer()).post(`/v1/synapse/address`).send(mockRequest).expect(200);
  });

  test('Should return undeliverable if address verification fails', () => {
    const undelivarableAddress = {
      address_street: '766 N Fowler Ave',
      address_city: 'PDX',
      address_subdivision: 'OR',
      address_country_code: 'US',
      address_postal_code: '97217',
    };
    return request(app.getHttpServer())
      .post(`/v1/synapse/address`)
      .send(undelivarableAddress)
      .expect(200)
      .expect(({ body }) => {
        expect(body.address.deliverability).toBe('error');
      });
  });

  test('should return detailed custom errors if missing any required address fields are malformed', () => {
    const badRequest = {
      address_city: 'SF',
      address_subdivision: 'CA',
      address_country_code: 'US',
      address_postal_code: '',
    };
    return request(app.getHttpServer())
      .post(`/v1/synapse/address`)
      .send(badRequest)
      .expect(StatusCodes.BAD_REQUEST)
      .expect({
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Form errors',
        error: {
          address_street: ['address_street should not be empty', 'address_street must be a string'],
          address_postal_code: ['address_postal_code should not be empty'],
        },
      });
  });

  test('Should error if address makes no reasonable sense', () => {
    const undelivarableAddress = {
      address_street: '420 Ooowwiiiee way',
      address_city: 'CHI',
      address_subdivision: 'NOPE',
      address_country_code: 'MARS',
      address_postal_code: '12345',
    };
    return request(app.getHttpServer())
      .post(`/v1/synapse/address`)
      .send(undelivarableAddress)
      .expect(StatusCodes.BAD_REQUEST)
      .expect({
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'ADDRESS_VERIFICATION_FAILED',
        error: 'Bad Request',
      });
  });
});
