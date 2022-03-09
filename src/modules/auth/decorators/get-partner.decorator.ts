import { createParamDecorator } from '@nestjs/common';
import { Partner } from 'modules/partners/entities';

export const GetPartner = createParamDecorator((data, req): Partner => {
  const [incomingMessage] = req.getArgs();

  return incomingMessage.user as Partner;
});
