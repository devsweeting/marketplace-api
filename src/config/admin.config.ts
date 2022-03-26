import { registerAs } from '@nestjs/config';

export default registerAs('admin', () => {
  return {
    default: {
      cookiePassword: process.env.COOKIE_PASSWORD,
      cookieName: process.env.COOKIE_NAME,
      adminEmail: process.env.ADMIN_EMAIL,
      adminAddress: process.env.ADMIN_ADDRESS,
      sessionSecret: process.env.SESSION_SECRET,
    },
  };
});
