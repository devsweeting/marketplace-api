import { ActionContext, ActionRequest, flat, RecordActionResponse } from 'adminjs';
import { isPOSTMethod } from 'modules/admin/admin.utils';
import { Label } from 'modules/assets/entities';

export const saveLabels = async (
  response: RecordActionResponse,
  request: ActionRequest,
  context: ActionContext,
): Promise<RecordActionResponse> => {
  if (!isPOSTMethod(request)) {
    return response;
  }
  const { record } = context;

  if (!record.isValid()) return response;

  const { assetLabels } = flat.unflatten(request.payload);

  await Label.delete({ assetId: record.params.id });
  await Promise.all(
    assetLabels.map((label) => new Label({ ...label, assetId: record.params.id }).save()),
  );

  return response;
};
