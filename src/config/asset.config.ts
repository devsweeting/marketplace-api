import { registerAs } from '@nestjs/config';

export default registerAs('asset', () => {
  return {
    default: {
      maxMediaNumber: process.env.MAX_MEDIA_NUMBER,
    },
  };
});
