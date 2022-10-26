import { AssetDto } from 'modules/assets/dto';
import { Asset } from 'modules/assets/entities';
import { Partner } from 'modules/partners/entities';

export const softDeleteAsset = (asset: Asset): Promise<Asset> => {
  asset.deletedAt = new Date();
  asset.isDeleted = true;
  return asset.save();
};

export const createAsset = async (data: Partial<AssetDto>, partner: Partner): Promise<Asset> => {
  const dto = new AssetDto({
    refId: 'test',
    name: `Example ${Date.now()}`,
    description: 'test description',
    fractionQtyTotal: 1000,
    ...data,
  });
  return Asset.saveAssetForPartner(new AssetDto({ ...dto }), partner);
};
