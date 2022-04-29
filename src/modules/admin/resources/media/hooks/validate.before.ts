import { ActionRequest, flat, PropertyErrors, ValidationError } from 'adminjs';
import { Media } from 'modules/assets/entities';
import { MediaTypeEnum } from 'modules/assets/enums/media-type.enum';

import { isPOSTMethod } from '../../../admin.utils';

export const validate =
  () =>
  async (request: ActionRequest): Promise<ActionRequest> => {
    if (!isPOSTMethod(request)) {
      return request;
    }

    const payload = flat.unflatten(request.payload);

    const errors: PropertyErrors = {};

    const VIDEO_REGEX =
      /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+(?:&|&#38;);v=))((?:\w|-|_){11})$/;

    if (!payload.title) {
      errors.title = { message: 'Title is required' };
    }

    if (
      payload.sortOrder &&
      payload.sortOrder.trim() !== '' &&
      !/^[0-9]+$/.test(payload.sortOrder)
    ) {
      errors.sortOrder = { message: 'Order is invalid' };
    }

    if (!payload.type) {
      errors.type = { message: 'Type is required' };
    }

    if (payload.type === MediaTypeEnum.Youtube) {
      if (payload.file.length > 0) {
        errors.type = { message: 'Wrong type' };
      }

      if (!payload.url.length || !(payload.url && VIDEO_REGEX.test(payload.url))) {
        errors.url = { message: 'Url format is invalid' };
      }
    }

    if (!payload.assetId) {
      errors.assetId = { message: 'Asset is required' };
    }

    if (payload.sortOrder) {
      const getMedia = await Media.findOne({
        where: { assetId: payload.assetId, sortOrder: payload.sortOrder },
      });
      if (getMedia && getMedia.id !== payload?.id) {
        errors.sortOrder = { message: 'Order must be unique' };
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
