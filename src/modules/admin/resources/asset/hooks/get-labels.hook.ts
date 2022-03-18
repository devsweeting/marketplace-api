import { ActionRequest, flat, RecordActionResponse } from 'adminjs';
import { Label } from 'modules/assets/entities';
import { isGETMethod } from 'modules/admin/admin.utils';

export const getLabels = async (
  response: RecordActionResponse,
  request: ActionRequest,
): Promise<RecordActionResponse> => {
  if (!isGETMethod(request)) {
    return response;
  }

  if (response.records) {
    await Promise.all(
      response.records.map(async (record) => {
        const params = flat.unflatten(record.params);
        params.assetLabels = await Label.find({ where: { assetId: record.params.recordId } });
        record.params = flat.flatten(params);
        return record;
      }),
    );
  } else {
    const params = flat.unflatten(response.record.params);
    params.assetLabels = await Label.find({ where: { assetId: request.params.recordId } });
    response.record.params = flat.flatten(params);
  }

  return response;
};
