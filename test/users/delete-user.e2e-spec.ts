import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createApp } from '@/test/utils/app.utils';
import { User } from '@/src/modules/users/user.entity';
import { createUser } from '../utils/fixtures/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { generateToken } from '../utils/jwt.utils';

describe('UsersController', () => {
  let app: INestApplication;
  let user: User;
  let admin: User;
  let partner: User;

  beforeEach(async () => {
    app = await createApp();
    user = await createUser({ role: RoleEnum.USER });
  });

  afterAll(async () => {
    await User.delete({});
    await app.close();
  });

  describe(`DELETE /users/:id AS SUPER_ADMIN`, () => {
    beforeEach(async () => {
      admin = await createUser({ role: RoleEnum.SUPER_ADMIN });
    });
    it('should delete a user record from the db', () => {
      return request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({});
        })
        .then(async () => {
          const updatedUser = await User.findOne({ where: { id: user.id, isDeleted: false } });
          expect(updatedUser).not.toBeDefined();
        });
    });

    it('should throw an exception if user id does not exists', () => {
      const wrongId = '1D700038-58B1-4EF0-8737-4DB7D6A9D60F';
      return request(app.getHttpServer())
        .delete(`/users/${wrongId}`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'USER_NOT_FOUND',
          error: 'Not Found',
        });
    });
  });
  describe(`DELETE /users/:id AS ADMIN`, () => {
    beforeEach(async () => {
      admin = await createUser({ role: RoleEnum.ADMIN });
    });
    it('should not delete a user record from the db', () => {
      return request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .expect(403)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Forbidden',
            message: 'Forbidden resource',
            statusCode: 403,
          });
        })
        .then(async () => {
          const updatedUser = await User.findOne(user.id);
          expect(updatedUser).toBeDefined();
        });
    });

    it('should throw an exception if user id does not exists', () => {
      const wrongId = '1D700038-58B1-4EF0-8737-4DB7D6A9D60F';
      return request(app.getHttpServer())
        .delete(`/users/${wrongId}`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .expect(403);
    });
  });
  describe(`DELETE /users/:id AS USER`, () => {
    it('should not delete a user record from the db', () => {
      return request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .expect(403)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Forbidden',
            message: 'Forbidden resource',
            statusCode: 403,
          });
        })
        .then(async () => {
          const updatedUser = await User.findOne(user.id);
          expect(updatedUser).toBeDefined();
        });
    });

    it('should throw an exception if user id does not exists', () => {
      const wrongId = '1D700038-58B1-4EF0-8737-4DB7D6A9D60F';
      return request(app.getHttpServer())
        .delete(`/users/${wrongId}`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .expect(403);
    });
  });
  describe(`DELETE /users/:id AS PARTNER`, () => {
    beforeEach(async () => {
      partner = await createUser({ role: RoleEnum.PARTNER });
    });
    it('should not delete a user record from the db', () => {
      return request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .set({ Authorization: `Bearer ${generateToken(partner)}` })
        .expect(403)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Forbidden',
            message: 'Forbidden resource',
            statusCode: 403,
          });
        })
        .then(async () => {
          const updatedUser = await User.findOne(user.id);
          expect(updatedUser).toBeDefined();
        });
    });

    it('should throw an exception if user id does not exists', () => {
      const wrongId = '1D700038-58B1-4EF0-8737-4DB7D6A9D60F';
      return request(app.getHttpServer())
        .delete(`/users/${wrongId}`)
        .set({ Authorization: `Bearer ${generateToken(partner)}` })
        .expect(403);
    });
  });
});
