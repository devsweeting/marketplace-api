import { ActionRequest, flat, PropertyErrors, ValidationError } from 'adminjs';

import { isPOSTMethod } from '../../../admin.utils';

export const validate =
  () =>
  async (request: ActionRequest): Promise<ActionRequest> => {
    if (!isPOSTMethod(request)) {
      return request;
    }

    const payload = flat.unflatten(request.payload);

    const errors: PropertyErrors = {};

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

    if (!payload.assetId) {
      errors.assetId = { message: 'Asset is required' };
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
