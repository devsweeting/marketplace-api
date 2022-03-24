import { File } from 'modules/storage/entities/file.entity';
import { v4 } from 'uuid';
import { StorageEnum } from 'modules/storage/enums/storage.enum';

export const createFile = (data?: Partial<File>): Promise<File> => {
  const name = `${v4()}.jpeg`;
  const file = new File({
    path: `images/example/${name}`,
    name,
    size: 100,
    storage: StorageEnum.S3,
    ...data,
  });
  return file.save();
};
