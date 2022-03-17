import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => {
  return {
    default: {
      bucket: process.env.AWS_S3_BUCKET,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
    },
  };
});
