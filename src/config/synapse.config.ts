import { registerAs } from '@nestjs/config';

export default registerAs('synapse', () => {
  return {
    default: {
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      fingerprint: process.env.FINGERPRINT,
      ipAddress: '0.0.0.1', //TODO - what should the IP be?
      isProduction: false,
    },
  };
});
