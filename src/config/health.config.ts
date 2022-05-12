import { registerAs } from '@nestjs/config';

export default registerAs('health', () => {
  return {
    default: {
      maxRSSMB: process.env.HEALTHCHECK_RSS_MAX_MB,
      maxHeapMB: process.env.HEALTHCHECK_HEAP_MAX_MB,
    },
  };
});
