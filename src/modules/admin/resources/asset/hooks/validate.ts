import { ConfigService } from '@nestjs/config';
import { ActionRequest, flat, PropertyErrors, ValidationError } from 'adminjs';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';

import { isPOSTMethod } from '../../../admin.utils';

export const validate =
  (serviceAccessor: ServiceAccessor) =>
  async (request: ActionRequest): Promise<ActionRequest> => {
    if (!isPOSTMethod(request)) {
      return request;
    }
    const configService = serviceAccessor.getService(ConfigService);
    const payload = flat.unflatten(request.payload);

    const errors: PropertyErrors = {};

    if (payload.assetMedia.length > configService.get('asset.default.maxMediaNumber')) {
      errors.assetMedia = {
        message: `MAX_MEDIA_PER_ASSET is ${configService.get('asset.default.maxMediaNumber')}`,
      };
    }

    if (payload.assetMedia) {
      payload.assetMedia.map((el) => {
        if (!el.title) {
          errors.assetMedia = { message: 'Title is required' };
        }

        if (
          !el.sortOrder ||
          (el.sortOrder && el.sortOrder.trim() !== '' && !/^[0-9]+$/.test(el.sortOrder))
        ) {
          errors.assetMedia = { message: 'Order is invalid' };
        }
        if (
          el.sortOrder &&
          payload.assetMedia.filter((media) => Number(media.sortOrder) === Number(el.sortOrder))
            .length > 1
        ) {
          errors.assetMedia = { message: 'Order must be unique' };
        }

        if (!el.type) {
          errors.assetMedia = { message: 'Type is required' };
        }

        if (!el.url || (!el.url && !el.file.length)) {
          errors.assetMedia = { message: 'File is required' };
        }
      });
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
