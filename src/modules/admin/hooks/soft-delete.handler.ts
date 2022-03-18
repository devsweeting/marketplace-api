import { ActionContext, ActionHandler, ActionRequest, ActionResponse } from 'adminjs';

export const softDeleteHandler: ActionHandler<ActionResponse> = async (
  _request: ActionRequest,
  response: ActionResponse,
  context: ActionContext,
) => {
  const { record, resource, translateMessage, h: urlHelper } = context;

  if (!record) {
    return response;
  }

  record.params = await resource.update(record.params.id, {
    deletedAt: new Date(),
    isDeleted: true,
  });

  return {
    record: record.toJSON(context.currentAdmin),
    redirectUrl: urlHelper.resourceUrl({
      resourceId: resource._decorated?.id() || resource.id(),
    }),
    notice: {
      message: translateMessage('successfullyDeleted', resource.id()),
      type: 'success',
    },
  };
};

export default softDeleteHandler;
