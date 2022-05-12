import { Collection, CollectionAsset } from 'modules/collections/entities';

export const createCollection = (data: Partial<Collection>): Promise<Collection> => {
  const collection = new Collection({
    name: 'Example',
    slug: `example-${Date.now()}`,
    description: 'test description',
    ...data,
  });
  return collection.save();
};

export const createCollectionAsset = (data: Partial<CollectionAsset>): Promise<CollectionAsset> => {
  const collectionAsset = new CollectionAsset({
    ...data,
  });
  return collectionAsset.save();
};
