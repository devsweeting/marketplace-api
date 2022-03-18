import {
  ActionRequest,
  ActionResponse,
  BulkActionResponse,
  NotFoundError,
  ActionHandler,
} from 'adminjs';

export const bulkSoftDeleteHandler: ActionHandler<BulkActionResponse> = async (
  request: ActionRequest,
  _response: ActionResponse,
  context: any,
) => {
  const { records, resource, h, translateMessage } = context;

  if (!records || !records.length) {
    throw new NotFoundError('no records were selected.', 'Action#handler');
  }
  if (request.method === 'get') {
    const recordsInJSON = records.map((record) => record.toJSON(context.currentAdmin));
    return {
      records: recordsInJSON,
    };
  }

  if (request.method === 'post') {
    await Promise.all(
      records.map(
        (record) =>
          (record.params = resource.update(record.params.id, {
            deletedAt: new Date(),
            isDeleted: true,
          })),
      ),
    );
    return {
      records: records.map((record) => record.toJSON(context.currentAdmin)),
      notice: {
        message: translateMessage('successfullyBulkDeleted', resource.id(), {
          count: records.length,
        }),
        type: 'success',
      },
      redirectUrl: h.resourceUrl({ resourceId: resource._decorated?.id() || resource.id() }),
    };
  }
  throw new Error('method should be either "post" or "get"');
};

export default bulkSoftDeleteHandler;
