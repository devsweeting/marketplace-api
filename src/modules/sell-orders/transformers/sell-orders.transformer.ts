import { SellOrder } from '../entities';
import { Injectable } from '@nestjs/common';
import { SellOrderResponse } from '../responses';
import { Pagination } from 'nestjs-typeorm-paginate';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';

@Injectable()
export class SellOrdersTransformer {
  public transform(sellOrder: SellOrder): SellOrderResponse {
    return {
      id: sellOrder.id,
      assetId: sellOrder.assetId,
      userId: sellOrder.userId,
      partnerId: sellOrder.partnerId,
      fractionQty: Number(sellOrder.fractionQty),
      fractionQtyAvailable: Number(sellOrder.fractionQtyAvailable),
      fractionPriceCents: Number(sellOrder.fractionPriceCents),
      expireTime: Number(sellOrder.expireTime),
      startTime: Number(sellOrder.startTime),
      deletedTime: Number(sellOrder.deletedTime),
      type: sellOrder.type,
    };
  }

  public transformAll(sellOrder: SellOrder[]): SellOrderResponse[] {
    return sellOrder.map((order) => this.transform(order));
  }

  public transformPaginated(
    pagination: Pagination<SellOrder>,
  ): PaginatedResponse<SellOrderResponse> {
    return {
      meta: pagination.meta,
      items: this.transformAll(pagination.items),
    };
  }
}
