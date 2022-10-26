import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from '../utils/app.utils';

describe('Verify address with Synapse', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
  });

  test('Should verify if a synapse account already exists for the logg', () => {
    const createUserPost = {
      first_name: 'Devin',
      last_name: 'Sweeting',
      phone_number: '123-456-7890',
      address_street: '7666 N Fowler Ave',
      address_city: 'PDX',
      address_subdivision: 'OR',
      address_country_code: 'US',
      address_postal_code: '97217',
    };
    return (
      request(app.getHttpServer())
        .get(`/v1/synapse/user`)
        //   .send(createUserPost)
        .expect(200)
        .expect(({ body }) => {
          console.log('body', body);
          // expect(body.address.deliverability).toBe('error');
        })
    );
  });

  //   test('Should create a new synapse account without KYC if none exists', () => {});
  //   test('S', () => {});
});
