import faker from '@faker-js/faker';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { User } from 'modules/users/user.entity';

export const createUser = (data: Partial<User>): Promise<User> => {
  const user = new User({
    email: faker.internet.email(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    role: RoleEnum.USER,
    ...data,
  });
  return user.save();
};
