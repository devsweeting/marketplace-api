import { ActionContext, ActionRequest, flat, RecordActionResponse } from 'adminjs';
import { isPOSTMethod } from 'modules/admin/admin.utils';
import { Attribute } from 'modules/assets/entities';

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

  const { attributes } = flat.unflatten(request.payload);

  await Attribute.delete({ assetId: record.params.id });

  await Promise.all(
    attributes.map((attr) => new Attribute({ ...attr, assetId: record.params.id })),
  );

  return response;
};
