import { registerAs } from '@nestjs/config';

export default registerAs('rollbar', () => {
  return {
    default: {
      rollbarToken: process.env.ROLLBAR_TOKEN,
      rollbarEnvironment: process.env.ROLLBAR_ENVIRONMENT,
    },
  };
});
