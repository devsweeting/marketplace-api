import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createApp } from '@/test/utils/app.utils';
import { User } from '@/src/modules/users/user.entity';

describe('UsersController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await User.delete({});
    await app.close();
  });

  describe(`POST /users`, () => {
    it('should create a new user record in the db', () => {
      const userRequest: any = {
        email: 'test@mail.com',
        password: 'password',
      };

      return request(app.getHttpServer())
        .post(`/users`)
        .set({
          'x-api-key': 'somekey',
        })
        .send(userRequest)
        .expect(201);
    });

    it('should throw an exception if user object is undefined', () => {
      const userRequest: any = {};

      return request(app.getHttpServer())
        .post(`/users`)
        .set({
          'x-api-key': 'somekey',
        })
        .send(userRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'email must be an email',
            'email should not be empty',
            'password must be longer than or equal to 8 characters',
            'password should not be empty',
            'password must be a string',
          ],
          error: 'Bad Request',
        });
    });

    it('should throw an exception if user email is invalid', () => {
      const userRequest: any = {
        email: 'wrong-email',
        password: 'password',
      };

      return request(app.getHttpServer())
        .post(`/users`)
        .set({
          'x-api-key': 'somekey',
        })
        .send(userRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: ['email must be an email'],
          error: 'Bad Request',
        });
    });
    it('should throw an exception if user password is invalid', () => {
      const userRequest: any = {
        email: 'email@test.com',
        password: '',
      };

      return request(app.getHttpServer())
        .post(`/users`)
        .set({
          'x-api-key': 'somekey',
        })
        .send(userRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'password must be longer than or equal to 8 characters',
            'password should not be empty',
          ],
          error: 'Bad Request',
        });
    });
  });
});
