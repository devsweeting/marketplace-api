import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => {
  return {
    default: {
      accessKey: process.env.AWS_ACCESS_KEY,
      secretKey: process.env.AWS_SECRET_KEY,
      s3Bucket: process.env.AWS_S3_BUCKET,
    },
  };
});
