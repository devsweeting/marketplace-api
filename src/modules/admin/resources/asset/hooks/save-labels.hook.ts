import { ActionRequest, flat, RecordActionResponse } from 'adminjs';
import { isPOSTMethod } from 'modules/admin/admin.utils';
import { Label } from 'modules/assets/entities';

export const saveLabels = async (
  response: RecordActionResponse,
  request: ActionRequest,
): Promise<RecordActionResponse> => {
  if (!isPOSTMethod(request)) {
    return response;
  }

  const { labels } = flat.unflatten(request.payload);
  await Label.delete({ assetId: request.params.recordId });
  await Promise.all(
    labels.map((label) => new Label({ ...label, assetId: request.params.recordId }).save()),
  );

  return response;
};
