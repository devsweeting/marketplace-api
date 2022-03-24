import { Injectable, Logger } from '@nestjs/common';
import { Event } from './entities';
import { EventRequestDto, ListEventsDto } from 'modules/events/dto';

import { IPaginationMeta, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { AssetNotFoundException } from 'modules/assets/exceptions/asset-not-found.exception';

import { Asset } from 'modules/assets/entities';

@Injectable()
export class EventsService {
  public getList(params: ListEventsDto): Promise<Pagination<Event>> {
    return paginate<Event, IPaginationMeta>(Event.list(params), {
      page: params.page,
      limit: params.limit,
    });
  }

  public async getOne(id: string): Promise<Event> {
    const asset = await Event.findOne({
      where: { id, isDeleted: false },
      relations: ['asset'],
    });
    if (!asset) {
      throw new AssetNotFoundException();
    }
    return asset;
  }

  public async recordEventRequest(assetId: string, dto: EventRequestDto): Promise<Event> {
    const asset: Asset = await Asset.findOne(assetId);
    if (!asset) {
      throw new AssetNotFoundException();
    }
    Logger.log(`Event Request for asset ${asset.name}`);
    const { price, ...rest } = dto;
    const totalPrice = price * dto.quantity;
    const toAccount = 'toAccount'; // TODO
    const fromAccount = 'fromAccount'; // TODO
    const newRecord = new Event({ assetId: asset.id, totalPrice, fromAccount, toAccount, ...rest });
    await newRecord.save();
    return newRecord;
  }
}
