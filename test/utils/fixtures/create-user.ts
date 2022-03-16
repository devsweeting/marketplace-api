import { User } from '@/src/modules/users/user.entity';
import { faker } from '@faker-js/faker';
import { fillPayloadWithDefaults } from '../test-helper';

const getDefaults = () => ({
  email: faker.internet.email(),
  password: 'password',
  refId: undefined,
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  role: undefined,
});

export const createUser = async (payload = {}) => {
  const data = fillPayloadWithDefaults(payload, getDefaults());

  const record = User.create(data);
  await record.save();

  if (!record) return null;

  return record;
};
