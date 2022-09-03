import { Column, Entity } from 'typeorm';
import { BaseModel } from 'modules/common/entities/base.model';
import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { StorageEnum } from 'modules/storage/enums/storage.enum';

@Entity('files')
export class File extends BaseModel implements BaseEntityInterface {
  @Column()
  public name: string;

  @Column()
  public path: string;

  @Column({ default: 0, type: 'bigint' })
  public size: number;

  @Column({
    type: 'enum',
    enum: StorageEnum,
  })
  public storage: StorageEnum;

  @Column({ name: 'mime_type', nullable: true })
  public mimeType: string;

  @Column({ name: 'absoluteUrl', nullable: true })
  public absoluteUrl: string;

  public constructor(partial: Partial<File> = {}) {
    super();
    Object.assign(this, partial);
  }
}
