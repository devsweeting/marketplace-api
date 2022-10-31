import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateAccountDto } from 'modules/synapse/dto/create-account.dto';
import request from 'supertest';
import { createApp } from '../utils/app.utils';
// import { createSynapseUser } from '../utils/create-synapse-user';

describe('Verify address with Synapse', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  test('Should verify if a synapse account already exists for the logg', () => {
    const createAccountParams: CreateAccountDto = {
      first_name: 'Devin',
      last_name: 'Sweetums',
      email: 'test@example.com',
      phone_numbers: '202.762.1401',
      gender: 'M',
      date_of_birth: {
        day: 2,
        month: 5,
        year: 1989,
      },
      mailing_address: {
        address_street: '1 Market St.',
        address_city: 'SF',
        address_subdivision: 'CA',
        address_postal_code: '94105',
        address_country_code: 'US',
      },
    };
    return request(app.getHttpServer())
      .post(`/v1/synapse/user`)
      .send(createAccountParams)
      .expect((res) => {
        console.log('test res', res);
      })
      .expect(HttpStatus.CREATED);

    // .expect(({ body }) => {
    // console.log('body', body);
    // expect(body.address.deliverability).toBe('error');
  });

  test('Should create a new synapse account without KYC if none exists', () => {
    // const userSynapse = createSynapseUser(userId, userSynapseId, depositNodeId, refreshToken)
  });
});
