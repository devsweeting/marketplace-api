import { User } from 'modules/users/entities/user.entity';
import { INestApplication } from '@nestjs/common';
import { UserLogin, UserOtp } from 'modules/users/entities';
import request from 'supertest';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { ConfigService } from '@nestjs/config';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  const RealDate = Date;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    global.Date = RealDate;

    await clearAllData(), await app.close();
  });

  describe('OTP flow', () => {
    beforeEach(async () => {
      await User.delete({});
      await UserOtp.delete({});
      await UserLogin.delete({});
      global.Date.now = jest.fn(() => new Date('2022-09-01T10:20:30Z').getTime());
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
      expect(createUser.email).toBe(email);

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

    test('should test that a user is assigned a refresh token on succcessful login', async () => {
      const email = 'dev@jump.co';
      //sends the email for login
      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(200);

      //logs the otp password
      const userOtp = await UserOtp.findOne({ email });

      // confirm the user signs in and API returns a refresh token
      await request(app.getHttpServer())
        .post(`/v1/users/login/confirm`)
        .send({ token: userOtp.token, metadata: { ip: '0.0.0.0' } })
        .expect(200);

      const loggedInUser = await User.findOne({ email });
      //expect(userOtp.used).toBeTruthy(); //POTENTIAL ERROR? - The OTP token should be marked as used after login confirmation.
      expect(loggedInUser.refreshToken).toBeDefined();
    });

    test('should test that a refresh token returns a new access token for login.', async () => {
      const email = 'dev@jump.co';
      //sends the email for login
      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(200);

      //logs the otp token
      const userOtp = await UserOtp.findOne({ email });

      // Signs the user in using the OTP token
      await request(app.getHttpServer())
        .post(`/v1/users/login/confirm`)
        .send({ token: userOtp.token, metadata: { ip: '0.0.0.0' } })
        .expect(200); //should return an access token.

      const loggedInUser = await User.findOne({ email });
      const createdRefreshToken = loggedInUser.refreshToken;

      //move time forward for a unique signature
      global.Date.now = jest.fn(() => new Date('2022-09-05T10:20:30Z').getTime());

      //Check that the refresh token is assigned in user table.
      expect(createdRefreshToken).toBeDefined();

      //Send a new request to the /refresh endpoint
      await request(app.getHttpServer())
        .post(`/v1/users/login/refresh`)
        .send({ refreshToken: createdRefreshToken })
        .expect(200)
        .expect(({ body }) => {
          expect(body.accessToken).toBeDefined();
          expect(body.refreshToken).toBeDefined();
          expect(body.refreshToken).not.toEqual(createdRefreshToken);
        });
    });

    test('should test that a request is denied if the refresh token is expired.', async () => {
      const email = 'dev@jump.co';

      //sends the email for login
      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(200);

      //logs the otp token
      const userOtp = await UserOtp.findOne({ email });

      // Signs the user in using the OTP token
      await request(app.getHttpServer())
        .post(`/v1/users/login/confirm`)
        .send({ token: userOtp.token, metadata: { ip: '0.0.0.0' } })
        .expect(200); //should return an access token.

      const loggedInUser = await User.findOne({ email });
      expect(loggedInUser.refreshToken).toBeDefined();

      //move time forward past the 7d expiration
      global.Date.now = jest.fn(() => new Date('2022-09-08T10:20:30Z').getTime());

      await request(app.getHttpServer())
        .post(`/v1/users/login/refresh`)
        .send({ refreshToken: loggedInUser.refreshToken })
        .expect(401)
        .expect((request) => {
          const error = JSON.parse(request.text);
          expect(error.message).toBe('Unauthorized');
        });
    });
  });
});
