import { ActionRequest, flat, RecordActionResponse } from 'adminjs';
import { Event } from 'modules/events/entities';
import { isGETMethod } from 'modules/admin/admin.utils';

export const loadEvents = async (
  response: RecordActionResponse,
  request: ActionRequest,
): Promise<RecordActionResponse> => {
  if (!isGETMethod(request)) {
    return response;
  }
  const params = flat.unflatten(response.record.params);
  params.events = await Event.find({ where: { assetId: params.id } });
  response.record.params = flat.flatten(params);

  return response;
};
