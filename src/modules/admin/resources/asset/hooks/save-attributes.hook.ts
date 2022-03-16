import { ActionContext, ActionRequest, flat, RecordActionResponse } from 'adminjs';
import { isPOSTMethod } from 'modules/admin/admin.utils';
import { Asset } from 'modules/assets/entities';

export const saveAttributes = async (
  response: RecordActionResponse,
  request: ActionRequest,
  context: ActionContext,
): Promise<RecordActionResponse> => {
  if (!isPOSTMethod(request)) {
    return response;
  }
  const { record } = context;

  if (!record.isValid()) return response;

  const { assetAttributes } = flat.unflatten(request.payload);

  const asset = await Asset.findOne(record.params.id);
  if (Array.isArray(assetAttributes)) {
    await asset.saveAttributes(assetAttributes);
  }

  return response;
};
