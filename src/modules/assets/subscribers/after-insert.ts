import { Partner } from 'modules/partners/entities';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { Asset } from '../entities';
import { Event } from 'modules/events/entities';

@EventSubscriber()
export class AssetSubscriber implements EntitySubscriberInterface<Asset> {
  listenTo() {
    return Asset;
  }

  async afterInsert(event: InsertEvent<Asset>) {
    const partner = await Partner.findOne({ where: { id: event.entity.partnerId } });
    const assetEvent = new Event({ fromAccount: partner.accountOwnerId, asset: event.entity });

    await event.manager.getRepository(Event).save(assetEvent);
  }
}
