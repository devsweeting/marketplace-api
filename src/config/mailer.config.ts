import { registerAs } from '@nestjs/config';

export default registerAs('mailer', () => {
  return {
    default: {
      mailerHost: process.env.MAILER_HOST,
      mailerPort: process.env.MAILER_PORT,
      mailerSecure: process.env.MAILER_SECURE,
      mailerUser: process.env.MAILER_USER,
      mailerPassword: process.env.MAILER_PASSWORD,
      mailerFrom: process.env.MAILER_FROM,
    },
  };
});
