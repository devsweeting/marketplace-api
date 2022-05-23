import { registerAs } from '@nestjs/config';

export default registerAs('common', () => {
  return {
    default: {
      redirectRootUrl: process.env.REDIRECT_ROOT_URL,
    },
  };
});