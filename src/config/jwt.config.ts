import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  return {
    default: {
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiresIn: process.env.JWT_EXPIRATION_TIME,
      jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
      jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME,
    },
  };
});
