import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateAccountDto } from 'modules/synapse/dto/create-account.dto';
import request from 'supertest';
import { createApp } from '../utils/app.utils';
import { SynapseController } from 'modules/synapse/controllers/synapse.controller';
import { SynapseService } from 'modules/synapse/providers/synapse.service';
import {
  mockCreateAccountQuery,
  // synapseSavedUserCreatedResponse,
  account,
} from 'modules/synapse/test-variables';
import { createUser } from '../utils/create-user';
import { UserSynapse } from 'modules/synapse/entities/user-synapse.entity';
import { User } from 'modules/users/entities';
import { generateToken } from '../utils/jwt.utils';

describe('Synapse Controller', () => {
  let app: INestApplication;
  let synapseController: SynapseController;
  let synapseService: SynapseService;
  const mockCreateAccountDto: CreateAccountDto = mockCreateAccountQuery;
  let user: User;
  let headers;

  const providers = [
    {
      provide: SynapseService,
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      useValue: { createSynapseUserAccount: () => account },
    },
  ];

  beforeAll(async () => {
    app = await createApp(providers);
    user = await createUser({ email: 'test@example.com', id: account.account.userId });

    synapseService = app.get<SynapseService>(SynapseService);
    synapseController = app.get<SynapseController>(SynapseController);
  });

  afterAll(async () => {
    await app.close();
    jest.clearAllMocks();
    // await clearAllData(); //THROWS ERROR -> TypeORMError: Driver not Connected
  });

  beforeEach(async () => {
    headers = { Authorization: `Bearer ${generateToken(user)}` };
  });

  it('should be defined', () => {
    expect(synapseService).toBeDefined();
    expect(synapseController).toBeDefined();
  });

  describe('createUser', () => {
    test('Should create a new user account', async () => {
      // const newAccount = synapseSavedUserCreatedResponse.User.body;

      const spy = jest
        .spyOn(synapseService, 'createSynapseUserAccount')
        .mockImplementation(async () => account);

      const response = await synapseController.createUser(
        mockCreateAccountDto,
        user,
        '::ffff:172.18.0.1',
      );

      expect(spy).toHaveBeenCalled();

      expect(response).toStrictEqual(account);
    });

    test('Should update database synapse details for the user', async () => {
      const response = await request(app.getHttpServer())
        .post(`/v1/synapse/user`)
        .set(headers)
        .send(mockCreateAccountDto)
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          console.log('body', body);

          return body;
        });

      // console.log('Resonse', response);

      // const userSynapseAccount = await UserSynapse.findAccountByUser(user.id);

      const userSynapseAccount = await UserSynapse.createQueryBuilder('user_synapse')
        // .where('user_synapse.userId = :userId', { userId: user.id })
        .getMany();
      console.log('userSynapseAccount', userSynapseAccount);

      expect(userSynapseAccount).not.toBeNull();
    });
  });
  test('Should return the users synapse account details if the account already existed', () => {
    // const userSynapse = createSynapseUser(userId, userSynapseId, depositNodeId, refreshToken);
  });
});
