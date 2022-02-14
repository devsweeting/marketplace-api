import { registerAs } from '@nestjs/config';

export default registerAs('server', () => {
  return {
    default: {
      port: process.env.SERVER_PORT,
    },
  };
});
