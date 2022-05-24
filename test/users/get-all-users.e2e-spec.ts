import { User } from 'modules/users/entities/user.entity';
import { INestApplication } from '@nestjs/common';
import { RoleEnum } from 'modules/users/enums/role.enum';
import request from 'supertest';

import { createApp } from '../utils/app.utils';
import { createUser } from '../utils/create-user';
import { generateToken } from '../utils/jwt.utils';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let users: User[];
  let admin: User;

  beforeAll(async () => {
    app = await createApp();
    users = [await createUser({}), await createUser({}), await createUser({})];
    admin = await createUser({ role: RoleEnum.SUPER_ADMIN });
  });

  afterAll(async () => {
    await User.delete({});
    await app.close();
  });

  describe('GET V1 /users AS SUPER_ADMIN', () => {
    it('return status 200 for authorized user', async () => {
      return request(app.getHttpServer())
        .get(`/v1/users`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .expect(200);
    });

    it('return status 401 for unauthorized user', async () => {
      return request(app.getHttpServer()).get(`/v1/users`).expect(401);
    });

    it('should list all users', async () => {
      await request(app.getHttpServer())
        .get('/v1/users')
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .expect(200)
        .expect(({ body }) => {
          expect(body.length).toEqual(4);

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
