import { User } from 'modules/users/entities/user.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
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
    const user = await createUser({});
    const user2 = await createUser({});
    const user3 = await createUser({});
    admin = await createUser({ role: RoleEnum.SUPER_ADMIN });
    users = [user, user2, user3, admin].sort((a, b) => a.lastName.localeCompare(b.lastName));
  });

  afterAll(async () => {
    await User.delete({});
    await app.close();
  });

  describe('GET V1 /users AS SUPER_ADMIN', () => {
    test('return status 200 for authorized user', async () => {
      return request(app.getHttpServer())
        .get(`/v1/users`)
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .expect(HttpStatus.OK);
    });

    test('return status 401 for unauthorized user', async () => {
      return request(app.getHttpServer()).get(`/v1/users`).expect(HttpStatus.UNAUTHORIZED);
    });

    test('should list all users sorted alphabetically by last name', async () => {
      await request(app.getHttpServer())
        .get('/v1/users')
        .set({ Authorization: `Bearer ${generateToken(admin)}` })
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          // eslint-disable-next-line no-magic-numbers
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
