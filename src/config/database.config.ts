import { registerAs } from '@nestjs/config';
import { getConfig } from './database/config';

export default registerAs('database', () => {
  return {
    default: getConfig(),
  };
});
