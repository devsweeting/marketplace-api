import { ServiceAccessor } from 'modules/admin/utils/service.accessor';

import { Media } from 'modules/assets/entities';
import { flat } from 'adminjs';
import { MediaService } from 'modules/assets/services/media.service';

const getChanges = (oldArray, newArray): Partial<Media>[] => {
  const changes = [];
  let i, item, j, len;
  if (JSON.stringify(oldArray) === JSON.stringify(newArray)) {
    return [];
  }

  for (i = j = 0, len = newArray.length; j < len; i = ++j) {
    item = newArray[i];
    if (JSON.stringify(item) !== JSON.stringify(oldArray[i])) {
      changes.push(item);
    }
  }
  return transform(changes);
};

const transform = (media: Media[]) => {
  return media.map((el) => {
    return {
      id: el.id,
      type: el.type,
      title: el.title,
      description: el.description,
      sortOrder: Number(el.sortOrder),
    };
  });
};

const saveMedia = (serviceAccessor: ServiceAccessor) => async (response, request, context) => {
  if (request.method !== 'post') return response;

  const { record } = context;
  const { assetMedia } = flat.unflatten(request.payload);

  if (!record.isValid()) {
    return response;
  }
  const params = flat.unflatten(record.params);
  const mediaService = serviceAccessor.getService(MediaService);

  const mediaList = await mediaService.getMediaListForAsset(params.id);

  const assetMediaIds = assetMedia ? assetMedia.map((el) => el.id) : [];
  const mediaListIds = mediaList ? mediaList.map((el) => el.id) : [];
  const mediaToAdd = assetMedia.filter((el) => !el.id);
  const mediaIdsToRemove = mediaListIds.filter((el) => !assetMediaIds.includes(el));

  const mediaToUpdate = getChanges(transform(mediaList), transform(assetMedia));

  if (mediaList.length) {
    await mediaService.updateAssetMedia(params.id, mediaToAdd, mediaIdsToRemove, mediaToUpdate);
  } else {
    await mediaService.attachAssetMedia(params.id, assetMedia);
  }

  return response;
};

export default saveMedia;
