import { faker } from '@faker-js/faker';
import { BasicKycDto } from 'modules/payments/dto/basic-kyc.dto';
import { UserPaymentsAccount } from 'modules/payments/entities/user-payments-account.entity';
import { IPermissions } from 'modules/payments/interfaces/create-account';
import { paymentsAccountCreationSuccess } from 'modules/payments/test-variables';
import { User } from 'modules/users/entities/user.entity';

export const createMockBasicKycParams = (
  user: User,
  mockDtoOptions?: Partial<BasicKycDto>,
): BasicKycDto => {
  return {
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    phone_numbers: faker.phone.number('503.555.01##') as string,
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
  mockAccountOptions?: Partial<UserPaymentsAccount>,
): Promise<UserPaymentsAccount> => {
  const userPaymentAccount = new UserPaymentsAccount({
    userId: user.id,
    userAccountId: paymentsAccountCreationSuccess.User.id,
    depositNodeId: null,
    refreshToken: paymentsAccountCreationSuccess.User.body.refresh_token,
    permission: paymentsAccountCreationSuccess.User.body.permission as IPermissions,
    permission_code: paymentsAccountCreationSuccess.User.body.permission_code,
    ...mockAccountOptions,
  });

  return userPaymentAccount.save();
};
