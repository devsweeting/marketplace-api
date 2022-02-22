import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { BaseService } from '../../../modules/common/services';
import { Partner } from '../entities';
import { PartnerDto } from '../dto/';
import { InjectRepository } from '@nestjs/typeorm';
import { PartnerRepository } from '../repositories/partner.repository';

@Injectable()
export class PartnersService extends BaseService {
  public constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: PartnerRepository,
  ) {
    super();
  }

  /**
   * Get partner by id
   *
   * @param id: string
   * @returns Promise<PartnerDto>
   */
  public async findOneById(id: string): Promise<PartnerDto> {
    const partner: Partner = await this.partnerRepository.findOneById(id);

    if (!partner) {
      console.log('Invalid partner id');
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    return <PartnerDto>partner;
  }
}
