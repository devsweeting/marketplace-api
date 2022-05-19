import { registerAs } from '@nestjs/config';

export default registerAs('common', () => {
  return {
    default: {
      redirectRootUrl: process.env.REDIRECT_ROOT_URL,
      maxOtpRequestPerHour: parseInt(process.env.MAX_OTP_REQUEST_PER_HOUR) || 5,
      otpExpireDurationInMinute: parseInt(process.env.OTP_EXPRIRE_DURATION_IN_MINUTE) || 5,
    },
  };
});
