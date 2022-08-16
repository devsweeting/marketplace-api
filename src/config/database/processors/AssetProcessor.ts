import faker from '@faker-js/faker';
import { IProcessor } from 'typeorm-fixtures-cli';
import { Asset } from 'modules/assets/entities';

export default class AssetProcessor implements IProcessor<Asset> {
  preProcess(name: string, object: any): any {
    return { ...object };
  }

  postProcess(name: string, obj: { [key: string]: any }): void {
    obj.fractionQtyTotal = faker.datatype.number({ min: 10000, max: 100000 });
    obj.attributes = {};
    obj.attributes['category'] = [faker.helpers.randomize(['Baseball', 'Basketball'])];
    obj.attributes['crading service'] = [faker.helpers.randomize(['BGS', 'PSA'])];
    obj.attributes['grade'] = [faker.datatype.number({ min: 0, max: 10 })];
    obj.attributes['year'] = [faker.datatype.number({ min: 1900, max: 2023 })];
    obj.attributes['brand'] = [
      faker.helpers.randomize([
        'Michael Jordan',
        'Stephen Curry',
        'Tiger Woods',
        'Kobe Bryant',
        'Lebron James',
        'Mike Trout',
        'Ken Griffey Jr.',
        'Barry Bonds',
        'Joe DiMaggio',
        'Joe Montana',
        'Wade Boggs',
        'Mike Piazza',
        'Mickey Mantle',
      ]),
    ];
  }
}
