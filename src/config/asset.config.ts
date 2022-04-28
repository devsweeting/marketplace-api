import { registerAs } from '@nestjs/config';

export default registerAs('asset', () => {
  return {
    default: {
      maxMediaNumber: process.env.MAX_MEDIA_PER_ASSET,
      watchlistNumberOfItems: process.env.WATCHLIST_NUMBER_OF_ITEMS,
    },
  };
});
