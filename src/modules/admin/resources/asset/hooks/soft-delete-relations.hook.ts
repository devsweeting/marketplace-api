import { ActionContext, ActionRequest, RecordActionResponse } from 'adminjs';
import { isGETMethod, isPOSTMethod } from 'modules/admin/admin.utils';
import { Attribute, Label, Media, Token } from 'modules/assets/entities';

const updateRelation = async (record) => {
  await Token.update({ assetId: record.params.id }, { isDeleted: true, deletedAt: new Date() });
  await Attribute.update({ assetId: record.params.id }, { isDeleted: true, deletedAt: new Date() });
  await Label.update({ assetId: record.params.id }, { isDeleted: true, deletedAt: new Date() });
  await Media.update({ assetId: record.params.id }, { isDeleted: true, deletedAt: new Date() });
};

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
        await updateRelation(record);
      }),
    );
  } else {
    if (!isGETMethod(request)) {
      return response;
    }
    const { record } = context;
    await updateRelation(record);
  }

  return response;
};
