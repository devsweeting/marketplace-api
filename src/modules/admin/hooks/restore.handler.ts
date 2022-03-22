import { ActionContext, ActionRequest, ActionResponse } from 'adminjs';

export const restoreHandler = async (
  _request: ActionRequest,
  response: ActionResponse,
  context: ActionContext,
) => {
  const { currentAdmin, record, resource, translateMessage, h: urlHelper } = context;
  if (!record) {
    return response;
  }

  record.params = await resource.update(record.id(), {
    isDeleted: false,
    deletedAt: null,
  });

  return {
    record: resource.build(record?.toJSON()).toJSON(currentAdmin),
    redirectUrl: urlHelper.resourceUrl({
      resourceId: resource._decorated?.id() || resource.id(),
    }),
    notice: {
      message: translateMessage('successfullyRestored', resource.id()),
    },
  };
};
