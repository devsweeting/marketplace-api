import { User } from 'modules/users/entities/user.entity';
import { INestApplication } from '@nestjs/common';
import { UserLogin, UserOtp } from 'modules/users/entities';
import request from 'supertest';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { ConfigService } from '@nestjs/config';
import { UserRefresh } from 'modules/users/entities/user-refresh.entity';
import { StatusCodes } from 'http-status-codes';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  const realJwtExp = process.env.JWT_EXPIRATION_TIME;
  beforeAll(async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    process.env.JWT_EXPIRATION_TIME = '60';
    process.env.JWT_REFRESH_EXPIRATION_TIME = '7d';
    app = await createApp();
  });

  afterAll(async () => {
    jest.useRealTimers();
    process.env.JWT_EXPIRATION_TIME = realJwtExp;

    await clearAllData(), await app.close();
  });

  describe('OTP flow', () => {
    beforeEach(async () => {
      await User.delete({});
      await UserOtp.delete({});
      await UserLogin.delete({});
      jest.setSystemTime(new Date('2022-09-01T10:20:30Z'));
    });
    test('should success', async () => {
      const email = 'danny@gmail.com';
      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(StatusCodes.OK);

      // OtpRecord created
      const userOtp = await UserOtp.findOne({ where: { email } });
      expect(userOtp.email).toBe(email);

      // confirm
      await request(app.getHttpServer())
        .post(`/v1/users/login/confirm`)
        .send({ token: userOtp.token, metadata: { ip: '0.0.0.0' } })
        .expect(StatusCodes.OK);

      const createUser = await User.findOne({ where: { email } });
      const NUMBER_OF_USERS = 1;
      expect(createUser.email).toBe(email);
      expect(await UserLogin.count({ where: { userId: createUser.id } })).toBe(NUMBER_OF_USERS);
    });

    test('should return 429 for too many requests', async () => {
      const email = 'danny@gmail.com';
      for (let i = 0; i <= app.get(ConfigService).get('common.default.maxOtpRequestPerHour'); i++) {
        await request(app.getHttpServer())
          .post(`/v1/users/login/request`)
          .send({ email })
          .expect(StatusCodes.OK);
      }

      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(StatusCodes.TOO_MANY_REQUESTS);
    });

    test('should fail with invalid token', async () => {
      const email = 'danny@gmail.com';
      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(StatusCodes.OK);

      // confirm
      await request(app.getHttpServer())
        .post(`/v1/users/login/confirm`)
        .send({ token: 'random token', metadata: { ip: '0.0.0.0' } })
        .expect(StatusCodes.BAD_REQUEST);
    });

    test('should success if email is uppercase', async () => {
      const email = 'FOO@BAR.COM';
      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(StatusCodes.OK);

      // OtpRecord created
      const userOtp = await UserOtp.findOne({ where: { email: email.toLowerCase() } });
      expect(userOtp).toBeDefined();
      expect(userOtp.email).toBe(email.toLowerCase());

      // confirm
      await request(app.getHttpServer())
        .post(`/v1/users/login/confirm`)
        .send({ token: userOtp.token, metadata: { ip: '0.0.0.0' } })
        .expect(StatusCodes.OK);

      const createUser = await User.findOne({ where: { email: email.toLowerCase() } });
      const NUMBER_OF_USERS = 1;
      expect(createUser.email).toBe(email.toLowerCase());
      expect(await UserLogin.count({ where: { userId: createUser.id } })).toBe(NUMBER_OF_USERS);
    });

    test('should success if email has uppercase and lowercase letters', async () => {
      const email = 'FoO@bAr.CoM';
      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(StatusCodes.OK);

      // OtpRecord created
      const userOtp = await UserOtp.findOne({ where: { email: email.toLowerCase() } });
      expect(userOtp).toBeDefined();
      expect(userOtp.email).toBe(email.toLowerCase());
      // confirm
      await request(app.getHttpServer())
        .post(`/v1/users/login/confirm`)
        .send({ token: userOtp.token, metadata: { ip: '0.0.0.0' } })
        .expect(StatusCodes.OK);

      const createUser = await User.findOne({ where: { email: email.toLowerCase() } });
      const NUMBER_OF_USERS = 1;
      expect(createUser.email).toBe(email.toLowerCase());
      expect(await UserLogin.count({ where: { userId: createUser.id } })).toBe(NUMBER_OF_USERS);
    });

    test('should test that a user is assigned a refresh token on successful login', async () => {
      const email = 'dev@jump.co';
      //sends the email for login
      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(StatusCodes.OK);

      //logs the otp password
      const userOtp = await UserOtp.findOne({ where: { email } });

      // confirm the user signs in and API returns a refresh token
      await request(app.getHttpServer())
        .post(`/v1/users/login/confirm`)
        .send({ token: userOtp.token, metadata: { ip: '0.0.0.0' } })
        .expect(StatusCodes.OK);

      const loggedInUser = await User.findOne({ where: { email } });
      const refreshToken = await UserRefresh.findOne({ where: { userId: loggedInUser.id } });
      expect(refreshToken.userId).toMatch(loggedInUser.id);
      expect(refreshToken.isExpired).toBeFalsy();
    });

    test('should allow user to sign into multiple devices, assigning a different refresh token to each session', async () => {
      const email = 'dev@jump.co';
      //sends the email for login
      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(StatusCodes.OK);

      //logs the otp password
      const userOtp = await UserOtp.findOne({ where: { email } });

      // confirm the user signs in and API returns a refresh token
      await request(app.getHttpServer())
        .post(`/v1/users/login/confirm`)
        .send({ token: userOtp.token, metadata: { ip: '0.0.0.0' } })
        .expect(StatusCodes.OK);

      const loggedInUser = await User.findOne({ where: { email } });
      expect(loggedInUser).toBeDefined();

      //move time forward for a unique signature
      jest.setSystemTime(new Date('2022-09-05T10:20:30Z'));

      //Sign in again on a "different device"
      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(StatusCodes.OK);

      const userOtp2 = await UserOtp.findOne({ where: { email, used: false } });

      // confirm the user signs in and API returns a refresh token
      await request(app.getHttpServer())
        .post(`/v1/users/login/confirm`)
        .send({ token: userOtp2.token, metadata: { ip: '1.1.1.1' } })
        .expect(StatusCodes.OK);

      const userRefreshTokens = await UserRefresh.findValidByUser(loggedInUser.id);
      const MINIMUM_NUMBER_OF_REFRESH_TOKENS = 2;
      expect(userRefreshTokens.length).toBeGreaterThanOrEqual(MINIMUM_NUMBER_OF_REFRESH_TOKENS);
      //both tokens should have the same userId
      expect(userRefreshTokens[0].userId).toEqual(userRefreshTokens[0].userId);
      //Refresh tokens should be different
      expect(userRefreshTokens[0].refreshToken).not.toEqual(userRefreshTokens[1].refreshToken);
      // both tokens should still be active
      expect(userRefreshTokens[0].isExpired).toBeFalsy();
      expect(userRefreshTokens[1].isExpired).toBeFalsy();
    });

    test('should test that a refresh token returns a new access token for login.', async () => {
      const email = 'dev@jump.co';
      //sends the email for login
      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(StatusCodes.OK);

      //logs the otp token
      const userOtp = await UserOtp.findOne({ where: { email } });

      // Signs the user in using the OTP token
      await request(app.getHttpServer())
        .post(`/v1/users/login/confirm`)
        .send({ token: userOtp.token, metadata: { ip: '0.0.0.0' } })
        .expect(StatusCodes.OK); //should return an access token.

      const loggedInUser = await User.findOne({ where: { email } });
      const token = await UserRefresh.findOne({ where: { userId: loggedInUser.id } });

      //move time forward for a unique signature
      jest.setSystemTime(new Date('2022-09-05T10:20:30Z'));

      //Check that the refresh token is assigned in user table.
      expect(token).toBeDefined();

      //Send a new request to the /refresh endpoint
      await request(app.getHttpServer())
        .post(`/v1/users/login/refresh`)
        .send({ refreshToken: token.refreshToken })
        .expect(StatusCodes.OK)
        .expect(({ body }) => {
          expect(body.accessToken).toBeDefined();
          expect(body.refreshToken).toBeDefined();
          expect(body.refreshToken).not.toEqual(token.refreshToken);
        });

      //check that the first assigned refresh token is marked as expired.
      await token.reload();
      expect(token.isExpired).toBeTruthy();
    });

    test('should test that a request is denied if the refresh token is expired.', async () => {
      const email = 'dev@jump.co';

      //sends the email for login
      await request(app.getHttpServer())
        .post(`/v1/users/login/request`)
        .send({ email })
        .expect(StatusCodes.OK);

      //logs the otp token
      const userOtp = await UserOtp.findOne({ where: { email } });

      // Signs the user in using the OTP token
      await request(app.getHttpServer())
        .post(`/v1/users/login/confirm`)
        .send({ token: userOtp.token, metadata: { ip: '0.0.0.0' } })
        .expect(StatusCodes.OK); //should return an access token.

      const loggedInUser = await User.findOne({ where: { email } });
      const token = await UserRefresh.findOne({ where: { userId: loggedInUser.id } });

      //move time forward past the 7d expiration
      jest.setSystemTime(new Date('2022-09-08T10:20:30Z'));

      await request(app.getHttpServer())
        .post(`/v1/users/login/refresh`)
        .send({ refreshToken: token.refreshToken })
        .expect(StatusCodes.UNAUTHORIZED)
        .expect((request) => {
          const error = JSON.parse(request.text);
          expect(error.message).toBe('Unauthorized');
        });
    });
  });
});
