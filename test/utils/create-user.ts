import { faker } from '@faker-js/faker';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { User } from 'modules/users/entities/user.entity';
import { generateNonce } from './jwt.utils';

export const createUser = (data: Partial<User>): Promise<User> => {
  const user = new User({
    email: faker.internet.email(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    role: RoleEnum.USER,
    address: 'AAA',
    nonce: generateNonce(),
    ...data,
  });
  return user.save();
};
