import { createParamDecorator } from '@nestjs/common';
import { User } from 'modules/users/user.entity';

export const GetUser = createParamDecorator((data, req): User => {
  const [incomingMessage] = req.getArgs();

  return incomingMessage.user as User;
});