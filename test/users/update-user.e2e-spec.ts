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

  describe(`PATCH /users/:id`, () => {
    it('should update a user record in the db', () => {
      const userRequest: any = {
        email: 'changed@mail.com',
      };
      return request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .set({
          'x-api-key': 'somekey',
        })
        .send(userRequest)
        .expect(200)
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
          const updatedUser = await User.findOne(user.id);
          expect(updatedUser).toBeDefined();
          expect(updatedUser.email).toEqual(userRequest.email);
        });
    });

    it('should throw an exception if user email is invalid', () => {
      const userRequest: any = {
        email: 'wrong-email',
      };

      return request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .set({
          'x-api-key': 'somekey',
        })
        .send(userRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: ['email must be an email'],
          error: 'Bad Request',
        });
    });
    it('should throw an exception if user password is exists in data', () => {
      const userRequest: any = {
        password: 'password',
      };

      return request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .set({
          'x-api-key': 'somekey',
        })
        .send(userRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: ['property password should not exist'],
          error: 'Bad Request',
        });
    });
  });
});
