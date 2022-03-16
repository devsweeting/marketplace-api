import { ActionRequest, flat, RecordActionResponse } from 'adminjs';
import { Attribute } from 'modules/assets/entities';
import { isGETMethod } from 'modules/admin/admin.utils';

export const loadAttributes = async (
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
        params.assetAttributes = await Attribute.find({ where: { assetId: params.id } });
        record.params = flat.flatten(params);
        return record;
      }),
    );
  } else {
    const params = flat.unflatten(response.record.params);
    params.assetAttributes = await Attribute.find({ where: { assetId: params.id } });
    response.record.params = flat.flatten(params);
  }

  return response;
};
