import { faker } from '@faker-js/faker';
import { CreateAccountDto } from 'modules/synapse/dto/create-account.dto';
import { UserSynapse } from 'modules/synapse/entities/user-synapse.entity';
import { IPermissions } from 'modules/synapse/interfaces/create-account';
import { synapseSavedUserCreatedResponse } from 'modules/synapse/test-variables';
import { User } from 'modules/users/entities/user.entity';

export const createMockAccountParams = (
  user: User,
  mockDtoOptions?: Partial<CreateAccountDto>,
): CreateAccountDto => {
  return {
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    phone_numbers: faker.phone.number('503.###.####') as string,
    gender: 'M',
    date_of_birth: {
      day: 2,
      month: 5,
      year: 1989,
    },
    mailing_address: {
      address_street: '1 Market St.',
      address_city: 'SF',
      address_subdivision: 'CA',
      address_postal_code: '94105',
      address_country_code: 'US',
    },
    ...mockDtoOptions,
  };
};

export const createMockPaymentsAccount = async (
  user: User,
  mockAccountOptions?: Partial<UserSynapse>,
): Promise<UserSynapse> => {
  const userPaymentAccount = new UserSynapse({
    userId: user.id,
    userSynapseId: synapseSavedUserCreatedResponse.User.id,
    depositNodeId: null,
    refreshToken: synapseSavedUserCreatedResponse.User.body.refresh_token,
    permission: synapseSavedUserCreatedResponse.User.body.permission as IPermissions,
    permission_code: synapseSavedUserCreatedResponse.User.body.permission_code,
    ...mockAccountOptions,
  });

  return userPaymentAccount.save();
};
