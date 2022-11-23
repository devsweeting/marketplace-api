import { INestApplication } from '@nestjs/common';
// import { User } from 'modules/users/entities';
import { clearAllData, createApp } from '../utils/app.utils';
// import { createUser } from '../utils/create-user';
// import { generateToken } from '../utils/jwt.utils';

describe('Payments Controller', () => {
  let app: INestApplication;
  // let user: User;
  //   let headers;

  beforeAll(async () => {
    app = await createApp();
    // user s= await createUser({ email: 'test@example.com' });
  });

  beforeEach(async () => {
    // headers = { Authorization: `Bearer ${generateToken(user)}` };
  });

  afterAll(async () => {
    await clearAllData();
  });

  it('Expect mocks to be defined', async () => {
    console.log('app', app);
    expect(app).toBeDefined();
    // expect(user).toBeDefined();
  });

  // test('Should create a FBO deposit account under the newly created payments account', async () => {
  //   // const mockParams = createMockBasicKycParams(user);
  //   // await request(app.getHttpServer())
  //   //   .post(`/v1/payments/kyc`)
  //   //   .set(headers)
  //   //   .send(mockParams)
  //   //   .expect(HttpStatus.CREATED)
  //   //   .expect(({ body }) => {
  //   //     expect(body.status).toBe(HttpStatus.CREATED);
  //   //   });
  //   // const userPaymentsAccount = await UserPaymentsAccount.findAccountByUserId(user.id);
  //   // expect(userPaymentsAccount.depositNodeId).not.toBeNull();
  // });

  // test('Should fail if unable to successfully create FBO account.', async () => {
  //   // const mockParams = createMockBasicKycParams(user);
  //   // await request(app.getHttpServer())
  //   //   .post(`/v1/payments/kyc`)
  //   //   .set(headers)
  //   //   .send(mockParams)
  //   //   .expect(HttpStatus.CREATED)
  //   //   .expect(({ body }) => {
  //   //     expect(body.status).toBe(HttpStatus.CREATED);
  //   //   });
  //   // const userPaymentsAccount = await UserPaymentsAccount.findAccountByUserId(user.id);
  //   // expect(userPaymentsAccount.depositNodeId).not.toBeNull();
  // });
});
