import faker from '@faker-js/faker';
import { IProcessor } from 'typeorm-fixtures-cli';
import { File } from 'modules/storage/entities/file.entity';

export default class FileProcessor implements IProcessor<File> {
  preProcess(name: string, object: any): any {
    return { ...object };
  }

  postProcess(name: string, object: { [key: string]: any }): void {
    const urls = [
      'assets/media/b2e7087f-7198-4225-ab1f-202db703fa46/d4b064af-59b4-459c-8275-05eefd5607fc',
      'assets/media/e91b100c-3e3e-4db1-8961-136c7a7d4493/e8e4c395-3a17-4dfc-bad6-5ed4437de36a',
      'assets/media/b82c2c8e-47fd-49f7-964b-e54cb1d8bf51/f4643338-f628-4ac6-9d52-73850ee03768',
      'assets/media/a49b2df6-7e7f-430b-8aa3-41ff431fca78/4646b2a5-469b-4277-b50e-ac7bc273a58a',
      'assets/media/cf21c917-3c74-4d2e-abfe-5127dcdae629/75042065-1ceb-495b-85d9-5a18242bf0a1',
      'assets/media/2342ccf8-2ec2-4994-90d2-cc219eeb0e12/26dc2e53-efa1-478f-95f7-1ec583368be8',
      'assets/media/67669b27-a83a-4161-b8bc-8624adfe7162/9624c57a-04d8-433b-9bf5-e3f10ab2ebea',
      'assets/media/6edb2444-d39b-40af-96d5-5e4e60571a3e/7b5d609d-8252-4a46-9db0-80c0ca018c5a',
      'assets/media/67669b27-a83a-4161-b8bc-8624adfe7162/9624c57a-04d8-433b-9bf5-e3f10ab2ebea',
      'assets/media/fba13f84-21f5-48ca-a2dc-9147d2c1ef4c/61084287-d5c1-4060-acae-8b6073815e75',
    ];
    object.path = faker.random.arrayElement(urls);
  }
}
