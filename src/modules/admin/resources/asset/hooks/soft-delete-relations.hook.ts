import { ActionContext, ActionRequest, RecordActionResponse } from 'adminjs';
import { isGETMethod, isPOSTMethod } from 'modules/admin/admin.utils';
import { Attribute, Label, Token } from 'modules/assets/entities';

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
        await Token.update(
          { assetId: record.params.id },
          { isDeleted: true, deletedAt: new Date() },
        );
        await Attribute.update(
          { assetId: record.params.id },
          { isDeleted: true, deletedAt: new Date() },
        );
        await Label.update(
          { assetId: record.params.id },
          { isDeleted: true, deletedAt: new Date() },
        );
      }),
    );
  } else {
    if (!isGETMethod(request)) {
      return response;
    }
    const { record } = context;
    await Token.update({ assetId: record.params.id }, { isDeleted: true, deletedAt: new Date() });
    await Attribute.update(
      { assetId: record.params.id },
      { isDeleted: true, deletedAt: new Date() },
    );
    await Label.update({ assetId: record.params.id }, { isDeleted: true, deletedAt: new Date() });
  }

  return response;
};
