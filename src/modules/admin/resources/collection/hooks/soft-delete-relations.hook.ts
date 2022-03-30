import { ActionContext, ActionRequest, RecordActionResponse } from 'adminjs';
import { isGETMethod, isPOSTMethod } from 'modules/admin/admin.utils';
import { CollectionAsset } from 'modules/collections/entities';

export const softDeleteRelations = async (
  response: RecordActionResponse,
  request: ActionRequest,
  context: ActionContext,
): Promise<RecordActionResponse> => {
  if (response.records) {
    if (!isPOSTMethod(request)) {
      return response;
    }

    await Promise.all(
      response.records.map(async (record) => {
        await CollectionAsset.update(
          { collectionId: record.params.id, isDeleted: false },
          { isDeleted: true, deletedAt: new Date() },
        );
      }),
    );
  } else {
    if (!isGETMethod(request)) {
      return response;
    }
    const { record } = context;
    await CollectionAsset.update(
      { collectionId: record.params.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
    );
  }

  return response;
};
