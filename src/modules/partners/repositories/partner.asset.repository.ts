import { Repository, EntityRepository } from 'typeorm';
import { PartnerAsset } from '../entities';

/**
 * Custom Repository to handle db queries related with the
 * Business Case
 */
@EntityRepository(PartnerAsset)
export class PartnerAssetRepository extends Repository<PartnerAsset> {
  /**
   * Get a Partner by given ID
   *
   * @param id Appointment Id
   * @returns Promise<Partner>
   */
  public findOneById(id: string): Promise<PartnerAsset> {
    const query = this.createQueryBuilder('partner_assets')
      .select([
        'partner_assets.id',
        'partner_assets.refId',
        'partner_assets.partnerId',
        'partner_assets.name',
        'partner_assets.image',
        'partner_assets.description',
        'partner_assets.updatedAt',
        'partner_assets.createdAt',
      ])
      .andWhere('partner_assets.id = :id', { id });

    return query.getOne();
  }
}
