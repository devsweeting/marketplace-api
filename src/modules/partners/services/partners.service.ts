import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseService } from 'modules/common/services';
import { Partner } from '../entities';
import { TransferRequestDto } from '../dto';

@Injectable()
export class PartnersService extends BaseService {
  public constructor() {
    super();
  }

  /**
   * Record a partner asset transfer request
   *
   */
  public async recordTransferRequest(partnerId: string, txreq: TransferRequestDto): Promise<void> {
    const partner: Partner = await Partner.findOne(partnerId);

    Logger.log(`Partner ${partner.name} received transfer request`);
    if (!txreq.assets) {
      throw new HttpException('Missing Assets', HttpStatus.BAD_REQUEST);
    }
  }
}
