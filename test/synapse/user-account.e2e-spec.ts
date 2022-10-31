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
      first_name: 'Lebron',
      last_name: 'James',
      email: 'test@example.com',
      phone_number: '202-555-0187',
      mailing_address: {
        address_street: '7666 N Fowler Ave',
        address_city: 'PDX',
        address_subdivision: 'OR',
        address_country_code: 'US',
        address_postal_code: '97217',
      },
    };
    return request(app.getHttpServer())
      .post(`/v1/synapse/user`)
      .send(createAccountParams)
      .expect((res) => {
        // console.log('test res', res);
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
