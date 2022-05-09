import { ConfigService } from '@nestjs/config';
import { ActionRequest, flat, PropertyErrors, ValidationError } from 'adminjs';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';
import { Asset } from 'modules/assets/entities';
import { MediaTypeEnum } from 'modules/assets/enums/media-type.enum';

import { isPOSTMethod } from '../../../admin.utils';

const initIndexArray = (mediaErrors, index) => {
  if (!mediaErrors[index]) {
    mediaErrors[index] = [];
  }
  return mediaErrors;
};

export const validate =
  (serviceAccessor: ServiceAccessor) =>
  async (request: ActionRequest): Promise<ActionRequest> => {
    if (!isPOSTMethod(request)) {
      return request;
    }
    const configService = serviceAccessor.getService(ConfigService);
    const payload = flat.unflatten(request.payload);

    const errors: PropertyErrors = {};

    const VIDEO_REGEX =
      /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+(?:&|&#38;);v=))((?:\w|-|_){11})$/;

    if (payload.assetMedia.length > configService.get('asset.default.maxMediaNumber')) {
      errors.assetMedia = {
        message: `MAX_MEDIA_PER_ASSET is ${configService.get('asset.default.maxMediaNumber')}`,
      };
    }
    const mediaErrors = {};
    if (payload.assetMedia) {
      payload.assetMedia.map((el, index) => {
        if (!el.title) {
          initIndexArray(mediaErrors, index);
          mediaErrors[index].push({ field: 'title', message: 'Title is required' });
        }

        if (
          !el.sortOrder ||
          (el.sortOrder && el.sortOrder.trim() !== '' && !/^[0-9]+$/.test(el.sortOrder))
        ) {
          initIndexArray(mediaErrors, index);
          mediaErrors[index].push({ field: 'sortOrder', message: 'Order is invalid' });
        }

        if (
          el.sortOrder &&
          payload.assetMedia.filter((media) => Number(media.sortOrder) === Number(el.sortOrder))
            .length > 1
        ) {
          initIndexArray(mediaErrors, index);
          mediaErrors[index].push({ field: 'sortOrder', message: 'Order must be unique' });
        }

        if (!el.type) {
          initIndexArray(mediaErrors, index);
          mediaErrors[index].push({ field: 'type', message: 'Type is required' });
        }

        if (el.type === MediaTypeEnum.Youtube) {
          if (el.file.length > 0) {
            initIndexArray(mediaErrors, index);
            mediaErrors[index].push({ field: 'type', message: 'Wrong type' });
          }

          if (!el.url.length || !(el.url && VIDEO_REGEX.test(el.url))) {
            initIndexArray(mediaErrors, index);
            mediaErrors[index].push({ field: 'url', message: 'Url format is invalid' });
          }
        }
        if (el.type === MediaTypeEnum.Image) {
          if (!el.id && !el.url.length && !el.file.length) {
            initIndexArray(mediaErrors, index);
            mediaErrors[index].push({ field: 'file', message: 'Url or File is required' });
            mediaErrors[index].push({ field: 'url', message: 'Url or File is required' });
          }
        }
      });
    }
    if (Object.keys(mediaErrors).length > 0) {
      errors.assetMedia = { message: JSON.stringify(mediaErrors) };
    }
    if (payload.refId) {
      const getAsset = await Asset.findOne({ where: { refId: payload.refId } });
      if (getAsset && getAsset.id !== payload?.id) {
        errors.refId = { message: 'Asset already exist with this refId' };
      }
    }

    if (Object.keys(errors).length) {
      throw new ValidationError(errors, {
        message: 'something wrong happened',
      });
    }

    request.payload = {
      ...payload,
    };

    return request;
  };
