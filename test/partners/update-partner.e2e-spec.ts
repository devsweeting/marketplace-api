import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { Partner, PartnerMemberUser } from 'modules/partners/entities';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';

describe('PartnerController', () => {
  let app: INestApplication;
  let partner: Partner;
  let user: User;

  beforeEach(async () => {
    app = await createApp();
    user = await createUser({ email: 'partner@test.com', role: RoleEnum.USER });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
    await createUser({ email: 'a@test.com', role: RoleEnum.USER });
    await createUser({ email: 'b@test.com', role: RoleEnum.USER });
  });

  afterEach(async () => {
    await Partner.delete({});
    await User.delete({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await Partner.delete({});
    await User.delete({});
    await clearAllData();
  });

  describe(`PATCH V1 /partners`, () => {
    it('should throw 401 exception if auth token is missing', () => {
      return request(app.getHttpServer()).patch(`/v1/partners`).send({}).expect(401);
    });

    it('should throw 401 exception if token is invalid', () => {
      return request(app.getHttpServer())
        .patch(`/v1/partners`)
        .set({
          'x-api-key': 'invalid key',
        })
        .send({})
        .expect(401);
    });

    it('should update user partner member', async () => {
      const payload = {
        emails: ['a@test.com', 'b@test.com'],
      };

      return request(app.getHttpServer())
        .patch(`/v1/partners`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            status: 200,
            description: 'Partner updated',
          });
        })
        .then(async () => {
          const updatedPartner = await Partner.findOne(partner.id, { relations: ['members'] });
          expect(updatedPartner).toBeDefined();
          expect(updatedPartner.members.length).toEqual(2);
          const u1 = await User.findOne({ where: { email: payload.emails[0] } });
          const u2 = await User.findOne({ where: { email: payload.emails[1] } });
          expect(updatedPartner.members.map((m: PartnerMemberUser) => m.userId).sort()).toEqual(
            [u2.id, u1.id].sort(),
          );
        });
    });
    it('should not update user partner member if email does not exist', async () => {
      const payload = {
        emails: ['c@test.com'],
      };

      return request(app.getHttpServer())
        .patch(`/v1/partners`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(404)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Not Found',
            message: `EMAIL_NOT_FOUND`,
            statusCode: 404,
          });
        })
        .then(async () => {
          const updatedPartner = await Partner.findOne(partner.id, { relations: ['members'] });
          expect(updatedPartner).toBeDefined();
          expect(updatedPartner.members.length).toEqual(0);
        });
    });
  });
});
