import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => {
  const defaultConfig = {
    accessKey: process.env.AWS_ACCESS_KEY,
    secretKey: process.env.AWS_SECRET_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_REGION,
    cloudFrontDomain: process.env.CLOUDFRONT_DOMAIN,
    s3ForcePathStyle: process.env.NODE_ENV === 'DEVELOP' || process.env.NODE_ENV === 'TEST',
  };
  if (process.env.AWS_ENDPOINT) {
    defaultConfig['endpoint'] = process.env.AWS_ENDPOINT;
  }
  return {
    default: defaultConfig,
  };
});
