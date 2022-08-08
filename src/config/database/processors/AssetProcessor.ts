import faker from '@faker-js/faker';
import { IProcessor } from 'typeorm-fixtures-cli';
import { Asset } from 'modules/assets/entities';

export default class AssetProcessor implements IProcessor<Asset> {
  preProcess(name: string, object: any): any {
    return { ...object };
  }

  postProcess(name: string, obj: { [key: string]: any }): void {
    obj.attributes = {};
    obj.attributes['Category'] = [faker.helpers.randomize(['Baseball', 'Basketball'])];
    obj.attributes['Grading Service'] = [faker.helpers.randomize(['BGS', 'PSA'])];
    obj.attributes['Grade'] = [faker.datatype.number({ min: 0, max: 10 })];
    obj.attributes['Year'] = [faker.datatype.number({ min: 1900, max: 2023 })];
  }
}
