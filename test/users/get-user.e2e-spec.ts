import { User } from '@/src/modules/users/user.entity';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createApp } from '../utils/app.utils';
import { createUser } from '../utils/fixtures/create-user';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let user: User;

  beforeAll(async () => {
    app = await createApp();
    user = await createUser({});
  });

  afterAll(async () => {
    await User.delete({});
    await app.close();
  });

  describe('GET /users/:id', () => {
    it('return status 200 for authorized user', async () => {
      return request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .set({
          'x-api-key': 'somekey',
        })
        .expect(200);
    });

    it('return status 401 for unauthorized user', async () => {
      return request(app.getHttpServer()).get(`/users/${user.id}`).expect(401);
    });

    it('should show user for authorized user', async () => {
      await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .set({
          'x-api-key': 'somekey',
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toEqual(user.id);
        });
    });
    it('should not show non exists user for authorized user', async () => {
      const wrongId = '1D700038-58B1-4EF0-8737-4DB7D6A9D60F';
      await request(app.getHttpServer())
        .get(`/users/${wrongId}`)
        .set({
          'x-api-key': 'somekey',
        })
        .expect(404);
    });
    it('should return 401 status for unavailable user for unauthorized user', async () => {
      const wrongId = '1D700038-58B1-4EF0-8737-4DB7D6A9D60F';
      await request(app.getHttpServer()).get(`/users/${wrongId}`).expect(401);
    });
  });
});
