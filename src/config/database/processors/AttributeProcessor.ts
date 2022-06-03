import faker from '@faker-js/faker';
import { IProcessor } from 'typeorm-fixtures-cli';
import { Attribute } from 'modules/assets/entities';

export default class AttributeProcessor implements IProcessor<Attribute> {
  preProcess(name: string, object: any): any {
    return { ...object };
  }

  postProcess(name: string, object: { [key: string]: any }): void {
    if (object.trait === 'CATEGORY') {
      object.value = faker.helpers.randomize(['Baseball', 'Basketball']);
    }
    if (object.trait === 'GRADING SERVICE') {
      object.value = faker.helpers.randomize(['BGS', 'PSA']);
    }
    if (object.trait === 'GRADE') {
      object.value = faker.datatype.number({ min: 0, max: 10 });
    }
    if (object.trait === 'YEAR') {
      object.value = faker.datatype.number({ min: 1900, max: 2023 });
    }
  }
}
