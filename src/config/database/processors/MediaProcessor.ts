import { faker } from '@faker-js/faker';
import { IProcessor } from 'typeorm-fixtures-cli';
import { Media } from 'modules/assets/entities/media.entity';

export default class MediaProcessor implements IProcessor<Media> {
  preProcess(name: string, object: any): any {
    return { ...object };
  }

  postProcess(name: string, object: { [key: string]: any }): void {
    object.sortOrder = faker.datatype.number({ min: 1, max: 5 });
  }
}
