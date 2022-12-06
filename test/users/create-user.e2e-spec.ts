import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { createApp } from '@/test/utils/app.utils';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { generateNonce, generateToken } from '../utils/jwt.utils';

describe('UsersController', () => {
  let app: INestApplication;
  let admin: User;

  beforeEach(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await User.delete({});
    await app.close();
  });

  describe(`POST V1 /users`, () => {
    beforeEach(async () => {
      admin = await createUser({ role: RoleEnum.SUPER_ADMIN, nonce: generateNonce() });
    });

    test('should create a new user record in the db', () => {
      const userRequest: { email: string; password: string } = {
        email: 'test@mail.com',
        password: 'password',
      };

      return request(app.getHttpServer())
        .post(`/v1/users`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .send(userRequest)
        .expect(HttpStatus.CREATED);
    });

    test('should throw an exception if user object is undefined', () => {
      const userRequest: Record<string, unknown> = {};

      return request(app.getHttpServer())
        .post(`/v1/users`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .send(userRequest)
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          statusCode: HttpStatus.BAD_REQUEST,
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

    test('should throw an exception if user email is invalid', () => {
      const userRequest: Record<string, string> = {
        email: 'wrong-email',
        password: 'password',
      };

      return request(app.getHttpServer())
        .post(`/v1/users`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .send(userRequest)
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['email must be an email'],
          error: 'Bad Request',
        });
    });
    test('should throw an exception if user password is invalid', () => {
      const userRequest: Record<string, string> = {
        email: 'email@test.com',
        password: '',
      };

      return request(app.getHttpServer())
        .post(`/v1/users`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .send(userRequest)
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          statusCode: HttpStatus.BAD_REQUEST,
          message: [
            'password must be longer than or equal to 8 characters',
            'password should not be empty',
          ],
          error: 'Bad Request',
        });
    });
  });
});
