import { registerAs } from '@nestjs/config';

export default registerAs('common', () => {
  return {
    default: {
      redirectRootUrl: process.env.REDIRECT_ROOT_URL,
      maxOtpRequestPerHour: parseInt(process.env.MAX_OTP_REQUEST_PER_HOUR) || 5,
      otpExpireDurationInMinute: parseInt(process.env.OTP_EXPIRE_DURATION_MINS) || 5,
      hashIdSalt: process.env.HASHID_SALT,
    },
  };
});
