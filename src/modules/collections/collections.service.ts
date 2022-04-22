import { Injectable } from '@nestjs/common';
import { StorageService } from 'modules/storage/storage.service';
import { Pagination, paginate, IPaginationMeta } from 'nestjs-typeorm-paginate';
import { CollectionDto, ListCollectionsDto } from './dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { Collection, CollectionAsset } from './entities';
import { CollectionNotFoundException } from './exceptions/collection-not-found.exception';

@Injectable()
export class CollectionsService {
  public constructor(private readonly storageService: StorageService) {}

  public getList(params: ListCollectionsDto): Promise<Pagination<Collection>> {
    return paginate<Collection, IPaginationMeta>(Collection.list(params), {
      page: params.page,
      limit: params.limit,
    });
  }

  public async getOne(id: string): Promise<Collection> {
    const collection = await Collection.findOne({
      where: { id, isDeleted: false },
      relations: ['assets', 'banner'],
    });
    if (!collection) {
      throw new CollectionNotFoundException();
    }
    return collection;
  }

  public async updateCollection(id: string, dto: UpdateCollectionDto): Promise<Collection> {
    const collection = await Collection.findOne({
      where: { id, isDeleted: false },
      relations: ['banner'],
    });
    if (!collection) {
      throw new CollectionNotFoundException();
    }

    const { banner, ...data } = dto;

    if (banner) {
      collection.banner = await this.storageService.uploadFromUrl(
        banner,
        `collections/${collection.id}`,
      );
    }

    Object.assign(collection, data);

    return collection.save();
  }

  public async deleteCollection(id: string): Promise<void> {
    const collection = await Collection.findOne({
      where: { id, isDeleted: false },
    });
    if (!collection) {
      throw new CollectionNotFoundException();
    }
    Object.assign(collection, { isDeleted: true, deletedAt: new Date() });
    await collection.save();

    await CollectionAsset.update(
      { collectionId: collection.id },
      { isDeleted: true, deletedAt: new Date() },
    );
  }

  public async createCollection(dto: CollectionDto): Promise<void> {
    const { banner, ...rest } = dto;
    const collection = new Collection({ ...rest });
    await collection.save();

    if (banner) {
      const getCollection = await Collection.findOne(collection.id);
      const collectionBanner = await this.storageService.uploadFromUrl(
        dto.banner,
        `collections/${collection.id}`,
      );

      Object.assign(getCollection, { bannerId: collectionBanner.id });
      await getCollection.save();
    }
  }
}