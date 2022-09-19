import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../entities';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

export const currentUser = createParamDecorator(async (data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const decodedUserJwtInfo = request.user;
  const user = await User.findOne({ where: { id: decodedUserJwtInfo.id } });
  if (!user) {
    throw new UserNotFoundException();
  }
  return user;
});
