import { User } from '@/src/modules/users/user.entity';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createApp } from '../utils/app.utils';
import { createUser } from '../utils/fixtures/create-user';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let users: User[];

  beforeAll(async () => {
    app = await createApp();
    users = [await createUser({}), await createUser({}), await createUser({})];
  });

  afterAll(async () => {
    await User.delete({});
    await app.close();
  });

  describe('GET /users', () => {
    it('return status 200 for authorized user', async () => {
      return request(app.getHttpServer())
        .get(`/users`)
        .set({
          'x-api-key': 'somekey',
        })
        .expect(200);
    });

    it('return status 401 for unauthorized user', async () => {
      return request(app.getHttpServer()).get(`/users`).expect(401);
    });

    it('should list all users', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set({ 'x-api-key': 'somekey' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.length).toEqual(3);

          const userResponse = body[0];
          const userResponse2 = body[1];
          const userResponse3 = body[2];

          expect(userResponse.id).toEqual(users[0].id);
          expect(userResponse2.id).toEqual(users[1].id);
          expect(userResponse3.id).toEqual(users[2].id);
        });
    });
  });
});
