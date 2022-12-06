import { User } from 'modules/users/entities/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { RoleEnum } from 'modules/users/enums/role.enum';
import request from 'supertest';

import { createApp } from '../utils/app.utils';
import { createUser } from '../utils/create-user';
import { generateToken } from '../utils/jwt.utils';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let user: User;
  let admin: User;

  beforeAll(async () => {
    app = await createApp();
    user = await createUser({});
  });

  afterAll(async () => {
    await User.delete({});
    await app.close();
  });

  describe('GET V1 /users/:id AS SUPER_ADMIN', () => {
    beforeEach(async () => {
      admin = await createUser({ role: RoleEnum.SUPER_ADMIN });
    });
    test('return status HttpStatus.OK for authorized user', async () => {
      return request(app.getHttpServer())
        .get(`/v1/users/${user.id}`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .expect(HttpStatus.OK);
    });

    test('return status 401 for unauthorized user', async () => {
      return request(app.getHttpServer())
        .get(`/v1/users/${user.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    test('should show user for authorized user', async () => {
      await request(app.getHttpServer())
        .get(`/v1/users/${user.id}`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.id).toEqual(user.id);
        });
    });
    test('should not show non exists user for authorized user', async () => {
      const wrongId = '1D700038-58B1-4EF0-8737-4DB7D6A9D60F';
      await request(app.getHttpServer())
        .get(`/v1/users/${wrongId}`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .expect(HttpStatus.NOT_FOUND);
    });
    test('should return 401 status for unavailable user for unauthorized user', async () => {
      const wrongId = '1D700038-58B1-4EF0-8737-4DB7D6A9D60F';
      await request(app.getHttpServer())
        .get(`/v1/users/${wrongId}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
