import { Repository, EntityRepository } from 'typeorm';
import { Partner } from '../entities/partner.entity';

/**
 * Custom Repository to handle db queries related with the
 * Business Case
 */
@EntityRepository(Partner)
export class PartnerRepository extends Repository<Partner> {
  /**
   * Get a Partner by given ID
   *
   * @param id Appointment Id
   * @returns Promise<Partner>
   */
  public findOneById(id: string): Promise<Partner> {
    const query = this.createQueryBuilder('partners')
      .select(['partners.id', 'partners.name', 'partners.updatedAt', 'partners.createdAt'])
      .andWhere('partners.id = :id', { id });

    return query.getOne();
  }
}
