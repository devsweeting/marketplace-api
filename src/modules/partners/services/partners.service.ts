import { Injectable, Logger } from '@nestjs/common';
import { BaseService } from 'modules/common/services';
import { Asset, Partner } from '../entities';
import { TransferRequestDto } from '../dto';
import { generateSlug } from 'modules/common/helpers/slug.helper';
import { AssetsDuplicatedException } from 'modules/partners/exceptions/assets-duplicated.exception';

@Injectable()
export class PartnersService extends BaseService {
  public async recordTransferRequest(partnerId: string, dto: TransferRequestDto): Promise<void> {
    const partner: Partner = await Partner.findOne(partnerId);

    Logger.log(`Partner ${partner.name} received transfer request`);

    const duplicatedAssetsBySlug = await Asset.findDuplicatedBySlugs(
      dto.assets.map((asset) => generateSlug(asset.name)),
    );

    if (duplicatedAssetsBySlug.length) {
      throw new AssetsDuplicatedException(duplicatedAssetsBySlug.map((asset) => asset.name));
    }

    await Asset.saveAssetsForPartner(dto.assets, partner);
  }
}
