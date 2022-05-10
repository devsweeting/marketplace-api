import { Asset } from 'modules/assets/entities';
import { generateSlug } from 'modules/common/helpers/slug.helper';
import { Raw } from 'typeorm';

export const softDeleteAsset = (asset: Asset) => {
  asset.deletedAt = new Date();
  asset.isDeleted = true;
  return asset.save();
};

export const createAsset = async (data: Partial<Asset>): Promise<Asset> => {
  const asset = new Asset({
    refId: 'test',
    name: `Example ${Date.now()}`,
    slug: await saveSlug(data.name ? data.name : `Example ${Date.now()}`),
    description: 'test description',
    ...data,
  });

  return asset.save();
};

const saveSlug = async (assetName: string) => {
  const assetsCount = await Asset.count({
    where: {
      slug: Raw((alias) => `${alias} ILIKE '%${generateSlug(assetName)}%'`),
      isDeleted: false,
      deletedAt: null,
    },
  });
  const name = assetsCount > 0 ? `${assetName} ${Date.now()}` : assetName;
  return generateSlug(name);
};
