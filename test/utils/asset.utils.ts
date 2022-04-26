import { Asset } from 'modules/assets/entities';

export const softDeleteAsset = (asset: Asset) => {
  asset.deletedAt = new Date();
  asset.isDeleted = true;
  return asset.save();
};

export const createAsset = (data: Partial<Asset>): Promise<Asset> => {
  const asset = new Asset({
    refId: 'test',
    name: 'Example',
    slug: 'example',
    description: 'test description',
    ...data,
  });

  return asset.save();
};
