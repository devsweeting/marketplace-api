import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { createApp } from '@/test/utils/app.utils';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { generateToken } from '../utils/jwt.utils';

describe('UsersController', () => {
  let app: INestApplication;
  let user: User;
  let admin: User;

  beforeEach(async () => {
    app = await createApp();
    user = await createUser({ role: RoleEnum.USER });
  });

  afterAll(async () => {
    await User.delete({});
    await app.close();
  });

  describe(`DELETE V1 /users/:id AS SUPER_ADMIN`, () => {
    beforeEach(async () => {
      admin = await createUser({ role: RoleEnum.SUPER_ADMIN });
    });
    test('should delete a user record from the db', () => {
      return request(app.getHttpServer())
        .delete(`/v1/users/${user.id}`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual({});
        })
        .then(async () => {
          const updatedUser = await User.findOne({ where: { id: user.id, isDeleted: false } });
          expect(updatedUser).toBeNull();
        });
    });

    test('should throw an exception if user id does not exists', () => {
      const wrongId = '1D700038-58B1-4EF0-8737-4DB7D6A9D60F';
      return request(app.getHttpServer())
        .delete(`/v1/users/${wrongId}`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'USER_NOT_FOUND',
          error: 'Not Found',
        });
    });
  });
  describe(`DELETE /users/:id AS ADMIN`, () => {
    beforeEach(async () => {
      admin = await createUser({ role: RoleEnum.ADMIN });
    });
    test('should not delete a user record from the db', () => {
      return request(app.getHttpServer())
        .delete(`/v1/users/${user.id}`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .expect(HttpStatus.FORBIDDEN)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Forbidden',
            message: 'Forbidden resource',
            statusCode: HttpStatus.FORBIDDEN,
          });
        })
        .then(async () => {
          const updatedUser = await User.findOneBy({ id: user.id });
          expect(updatedUser).toBeDefined();
        });
    });

    test('should throw an exception if user id does not exists', () => {
      const wrongId = '1D700038-58B1-4EF0-8737-4DB7D6A9D60F';
      return request(app.getHttpServer())
        .delete(`/v1/users/${wrongId}`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .expect(HttpStatus.FORBIDDEN);
    });
  });
  describe(`DELETE /users/:id AS USER`, () => {
    test('should not delete a user record from the db', () => {
      return request(app.getHttpServer())
        .delete(`/v1/users/${user.id}`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .expect(HttpStatus.FORBIDDEN)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Forbidden',
            message: 'Forbidden resource',
            statusCode: HttpStatus.FORBIDDEN,
          });
        })
        .then(async () => {
          const updatedUser = await User.findOneBy({ id: user.id });
          expect(updatedUser).toBeDefined();
        });
    });

    test('should throw an exception if user id does not exists', () => {
      const wrongId = '1D700038-58B1-4EF0-8737-4DB7D6A9D60F';
      return request(app.getHttpServer())
        .delete(`/v1/users/${wrongId}`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});
