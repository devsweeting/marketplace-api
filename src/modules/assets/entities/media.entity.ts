import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../common/entities/base.model';
import { Asset } from '.';
import { MediaTypeEnum } from '../enums/media-type.enum';
import { File } from 'modules/storage/entities/file.entity';

@Entity('asset_media', {
  orderBy: {
    sortOrder: 'ASC',
  },
})
export class Media extends BaseModel implements BaseEntityInterface {
  @Column({
    type: 'enum',
    enum: MediaTypeEnum,
    nullable: false,
  })
  public type: MediaTypeEnum;

  @Column({ nullable: false })
  public title: string;

  @Column({ nullable: true })
  public description: string;

  @Column({ nullable: false, default: '', length: 1024 })
  public source_url: string; //only update on the column name of the database

  @Column({ nullable: false })
  public sortOrder: number;

  @ManyToOne(() => File, { nullable: true })
  @JoinColumn({ name: 'fileId' })
  public file?: File;

  @Column({ type: 'string', nullable: true })
  @RelationId((media: Media) => media.file)
  public fileId?: string;

  @ManyToOne(() => Asset, (asset) => asset.media, { nullable: true })
  @JoinColumn({ name: 'assetId', referencedColumnName: 'id' })
  public asset: Asset;

  @Column({ type: 'string', nullable: true })
  @RelationId((media: Media) => media.asset)
  public assetId: string;

  public constructor(partial: Partial<Media>) {
    super();
    Object.assign(this, partial);
  }

  public static bulkSoftDelete(assetId: string, ids: string[] = []) {
    const query = Media.createQueryBuilder('media')
      .update()
      .set({ isDeleted: true, deletedAt: new Date() })
      .where(`assetId = :assetId`, { assetId });
    if (ids.length) {
      query.andWhereInIds(ids);
    }
    return query.execute();
  }
}
