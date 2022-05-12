import { Event } from '../entities';
import { Injectable } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';
import { EventResponse } from '../interfaces/response/event.response';

@Injectable()
export class EventsTransformer {
  public transform(event: Event): EventResponse {
    return {
      id: event.id,
      paymentToken: event.paymentToken,
      eventType: event.eventType,
      quantity: event.quantity,
      totalPrice: event.totalPrice,
      isPrivate: event.isPrivate,
      assetId: event.assetId,
      createdAt: event.createdAt.toISOString(),
    };
  }

  public transformAll(events: Event[]): EventResponse[] {
    return events.map((event) => this.transform(event));
  }

  public transformPaginated(pagination: Pagination<Event>): PaginatedResponse<EventResponse> {
    return {
      meta: pagination.meta,
      items: this.transformAll(pagination.items),
    };
  }
}
