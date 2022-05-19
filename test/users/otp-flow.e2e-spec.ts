import { User } from '@/src/modules/users/user.entity';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserLogin, UserOtp } from 'modules/users/entities';
import request from 'supertest';

import { createApp } from '../utils/app.utils';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('OTP flow', () => {
    beforeEach(async () => {
      await User.delete({});
      await UserOtp.delete({});
      await UserLogin.delete({});
    });
    it('should success', async () => {
      const email = 'danny@gmail.com';
      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(200);

      // OtpRecord created
      const userOtp = await UserOtp.findOne({ email });
      expect(userOtp.email).toBe(email);

      // confirm
      await request(app.getHttpServer())
        .post(`/v1/users/login/confirm`)
        .send({ token: userOtp.token, metadata: { ip: '0.0.0.0' } })
        .expect(200);

      const createUser = await User.findOne({ email });
      expect(createUser.email).toBe(email);
      expect(await UserLogin.count({ where: { user: createUser } })).toBe(1);
    });

    it('should return 429 for too many requests', async () => {
      const email = 'danny@gmail.com';
      for (let i = 0; i <= app.get(ConfigService).get('common.default.maxOtpRequestPerHour'); i++) {
        await request(app.getHttpServer())
          .post(`/v1/users/login/request`)
          .send({ email })
          .expect(200);
      }

      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(429);
    });

    it('should fail with invalid token', async () => {
      const email = 'danny@gmail.com';
      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(200);

      // confirm
      await request(app.getHttpServer())
        .post(`/v1/users/login/confirm`)
        .send({ token: 'random token', metadata: { ip: '0.0.0.0' } })
        .expect(400);
    });
  });
});
