import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createApp } from '@/test/utils/app.utils';
import { User } from '@/src/modules/users/user.entity';
import { createUser } from '../utils/fixtures/create-user';

describe('UsersController', () => {
  let app: INestApplication;
  let user: User;

  beforeEach(async () => {
    app = await createApp();
    user = await createUser({});
  });

  afterAll(async () => {
    await User.delete({});
    await app.close();
  });

  describe(`DELETE /users/:id`, () => {
    it('should delete a user record frm=om the db', () => {
      return request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .set({
          'x-api-key': 'somekey',
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({});
        })
        .then(async () => {
          const updatedUser = await User.findOne(user.id);
          expect(updatedUser).not.toBeDefined();
        });
    });

    it('should throw an exception if user id does not exists', () => {
      const wrongId = '1D700038-58B1-4EF0-8737-4DB7D6A9D60F';
      return request(app.getHttpServer())
        .delete(`/users/${wrongId}`)
        .set({
          'x-api-key': 'somekey',
        })
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'USER_NOT_FOUND',
          error: 'Not Found',
        });
    });
  });
});
