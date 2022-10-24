import { Injectable } from '@nestjs/common';
import { UserAsset } from '../entities/user-assets.entity';
import { IUserAssetResponse } from '../interfaces/userAsset.interface';

@Injectable()
export class UserAssetTransformer {
  public transform(userAsset: UserAsset): IUserAssetResponse | undefined {
    if (!userAsset) {
      return undefined;
    }
    return {
      id: userAsset.id,
      assetId: userAsset.assetId,
      quantityOwned: userAsset.quantityOwned,
    };
  }

  public transformAll(userAssets: UserAsset[]): IUserAssetResponse[] {
    return userAssets?.map((userAsset) => this.transform(userAsset));
  }
}
