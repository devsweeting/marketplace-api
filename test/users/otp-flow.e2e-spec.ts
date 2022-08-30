import { User } from 'modules/users/entities/user.entity';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserLogin, UserOtp } from 'modules/users/entities';
import request from 'supertest';

import { clearAllData, createApp } from '@/test/utils/app.utils';

//NOTE Could update this file name to something like 'user-session-flow.e2e-spec.ts' and put refresh token tests here
//TODO We use the One Time Password, or password recovery, as our log in flow. this off pattern should be documented.

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await clearAllData(), await app.close();
  });

  describe('OTP flow', () => {
    beforeEach(async () => {
      await User.delete({});
      await UserOtp.delete({});
      await UserLogin.delete({});
    });
    test('should success', async () => {
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
      console.log('should success', createUser);
      expect(createUser.email).toBe(email);
      expect(createUser.refreshToken).toBeDefined();
      expect(await UserLogin.count({ where: { user: createUser } })).toBe(1);
    });

    test('should return 429 for too many requests', async () => {
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

    test('should fail with invalid token', async () => {
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

    test('should success if email is uppercase', async () => {
      const email = 'FOO@BAR.COM';
      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(200);

      // OtpRecord created
      const userOtp = await UserOtp.findOne({ email: email.toLowerCase() });
      expect(userOtp).toBeDefined();
      expect(userOtp.email).toBe(email.toLowerCase());

      // confirm
      await request(app.getHttpServer())
        .post(`/v1/users/login/confirm`)
        .send({ token: userOtp.token, metadata: { ip: '0.0.0.0' } })
        .expect(200);

      const createUser = await User.findOne({ email: email.toLowerCase() });
      expect(createUser.email).toBe(email.toLowerCase());
      expect(createUser.refreshToken).toBeDefined();
      expect(await UserLogin.count({ where: { user: createUser } })).toBe(1);
    });

    test('should success if email has uppercase and lowercase letters', async () => {
      const email = 'FoO@bAr.CoM';
      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(200);

      // OtpRecord created
      const userOtp = await UserOtp.findOne({ email: email.toLowerCase() });
      expect(userOtp).toBeDefined();
      expect(userOtp.email).toBe(email.toLowerCase());
      // confirm
      await request(app.getHttpServer())
        .post(`/v1/users/login/confirm`)
        .send({ token: userOtp.token, metadata: { ip: '0.0.0.0' } })
        .expect(200);

      const createUser = await User.findOne({ email: email.toLowerCase() });
      expect(createUser.email).toBe(email.toLowerCase());
      expect(await UserLogin.count({ where: { user: createUser } })).toBe(1);
    });
  });
});
