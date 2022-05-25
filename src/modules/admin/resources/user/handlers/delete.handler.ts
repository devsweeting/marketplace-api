import {
  ActionContext,
  ActionHandler,
  ActionRequest,
  ActionResponse,
  RecordActionResponse,
} from 'adminjs';
import { User } from 'modules/users/entities/user.entity';
import { RoleEnum } from '../../../../users/enums/role.enum';

export const deleteHandler: ActionHandler<RecordActionResponse> = async (
  request: ActionRequest,
  _response: ActionResponse,
  context: ActionContext,
) => {
  const { record, resource, currentAdmin, h, translateMessage } = context;
  if (!request.params.recordId || !record) {
    throw new Error('You have to pass "recordId" to Delete Action');
  }

  const adminsCount = await User.createQueryBuilder('user')
    .andWhere('user.role = :role', { role: RoleEnum.SUPER_ADMIN })
    .andWhere('user.deletedAt IS NULL')
    .getCount();

  if (request.params.role === RoleEnum.SUPER_ADMIN && adminsCount === 1) {
    return {
      record: record.toJSON(currentAdmin),
      // eslint-disable-next-line no-underscore-dangle
      redirectUrl: h.resourceUrl({ resourceId: resource._decorated?.id() || resource.id() }),
      notice: {
        message: 'Cannot remove the last admin account',
        type: 'error',
      },
    };
  }

  await User.update(request.params.recordId, {
    deletedAt: new Date(),
    isDeleted: true,
  });

  return {
    record: record.toJSON(currentAdmin),
    // eslint-disable-next-line no-underscore-dangle
    redirectUrl: h.resourceUrl({ resourceId: resource._decorated?.id() || resource.id() }),
    notice: {
      message: translateMessage('successfullyDeleted', resource.id()),
      type: 'success',
    },
  };
};
