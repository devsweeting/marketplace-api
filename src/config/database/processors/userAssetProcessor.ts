import { faker } from '@faker-js/faker';
import { UserAsset } from 'modules/users/entities/user-assets.entity';
import { IProcessor } from 'typeorm-fixtures-cli';

export default class UserAssetsProcessor implements IProcessor<UserAsset> {
  preProcess(_name: string, object: UserAsset): any {
    return { ...object };
  }

  postProcess(_name: string, obj: UserAsset): void | Promise<void> {
    obj.quantityOwned = faker.datatype.number({ min: 10000, max: 100000 });
  }
}
