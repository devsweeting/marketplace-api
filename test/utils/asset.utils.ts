import { Asset } from 'modules/partners/entities';

export const createAsset = (data: Partial<Asset>): Promise<Asset> => {
  const asset = new Asset({
    refId: 'test',
    name: 'Example',
    image: 'image',
    slug: 'example',
    description: 'test description',
    ...data,
  });
  return asset.save();
};
