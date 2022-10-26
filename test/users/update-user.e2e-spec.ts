import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createApp } from '@/test/utils/app.utils';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { generateToken } from '../utils/jwt.utils';
import { StatusCodes } from 'http-status-codes';

describe('UsersController', () => {
  let app: INestApplication;
  let user: User;
  let admin: User;

  beforeEach(async () => {
    app = await createApp();
    user = await createUser({});
  });

  afterAll(async () => {
    await User.delete({});
    await app.close();
  });

  describe(`PATCH V1 /users/:id as SUPER_ADMIN`, () => {
    beforeEach(async () => {
      admin = await createUser({ role: RoleEnum.SUPER_ADMIN });
    });
    test('should update a user record in the db', () => {
      const userRequest: { email: string } = {
        email: 'changed@mail.com',
      };
      return request(app.getHttpServer())
        .patch(`/v1/users/${user.id}`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .send(userRequest)
        .expect(StatusCodes.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            id: user.id,
            email: userRequest.email,
            firstName: user.firstName,
            lastName: user.lastName,
            refId: user.refId,
            role: user.role,
          });
        })
        .then(async () => {
          const updatedUser = await User.findOneBy({ id: user.id });
          expect(updatedUser).toBeDefined();
          expect(updatedUser.email).toEqual(userRequest.email);
        });
    });

    test('should throw an exception if user email is invalid', () => {
      const userRequest: { email: string } = {
        email: 'wrong-email',
      };

      return request(app.getHttpServer())
        .patch(`/v1/users/${user.id}`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .send(userRequest)
        .expect(StatusCodes.BAD_REQUEST)
        .expect({
          statusCode: StatusCodes.BAD_REQUEST,
          message: ['email must be an email'],
          error: 'Bad Request',
        });
    });
    test('should throw an exception if user password is exists in data', () => {
      const userRequest: { password: string } = {
        password: 'password',
      };

      return request(app.getHttpServer())
        .patch(`/v1/users/${user.id}`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .send(userRequest)
        .expect(StatusCodes.BAD_REQUEST)
        .expect({
          statusCode: StatusCodes.BAD_REQUEST,
          message: ['property password should not exist'],
          error: 'Bad Request',
        });
    });
  });
  describe(`PATCH /users/:id as ADMIN`, () => {
    beforeEach(async () => {
      admin = await createUser({ role: RoleEnum.ADMIN });
    });
    test('should update a user record in the db', () => {
      const userRequest: { email: string } = {
        email: 'updated@mail.com',
      };
      return request(app.getHttpServer())
        .patch(`/v1/users/${user.id}`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .send(userRequest)
        .expect(StatusCodes.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            id: user.id,
            email: userRequest.email,
            firstName: user.firstName,
            lastName: user.lastName,
            refId: user.refId,
            role: user.role,
          });
        })
        .then(async () => {
          const updatedUser = await User.findOneBy({ id: user.id });
          expect(updatedUser).toBeDefined();
          expect(updatedUser.email).toEqual(userRequest.email);
        });
    });

    test('should throw an exception if user email is invalid', () => {
      const userRequest: { email: string } = {
        email: 'wrong-email',
      };

      return request(app.getHttpServer())
        .patch(`/v1/users/${user.id}`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .send(userRequest)
        .expect(StatusCodes.BAD_REQUEST)
        .expect({
          statusCode: StatusCodes.BAD_REQUEST,
          message: ['email must be an email'],
          error: 'Bad Request',
        });
    });
    test('should throw an exception if user password is exists in data', () => {
      const userRequest: { password: string } = {
        password: 'password',
      };

      return request(app.getHttpServer())
        .patch(`/v1/users/${user.id}`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .send(userRequest)
        .expect(StatusCodes.BAD_REQUEST)
        .expect({
          statusCode: StatusCodes.BAD_REQUEST,
          message: ['property password should not exist'],
          error: 'Bad Request',
        });
    });
  });
});
