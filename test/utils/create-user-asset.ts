import { UserAsset } from 'modules/users/entities/user-assets.entity';

export const createUserAsset = async ({
  assetId,
  userId,
  quantityOwned,
}: Partial<UserAsset>): Promise<UserAsset> => {
  const userAsset = new UserAsset({
    assetId: assetId,
    userId: userId,
    quantityOwned: quantityOwned,
  });

  return userAsset.save();
};
