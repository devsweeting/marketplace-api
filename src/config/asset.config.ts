import { registerAs } from '@nestjs/config';

export default registerAs('asset', () => {
  return {
    default: {
      maxMediaNumber: process.env.MAX_MEDIA_PER_ASSET,
      watchlistNumberOfItems: process.env.WATCHLIST_NUMBER_OF_ITEMS,
      filterAttributeMaxNumber: process.env.MAX_FILTER_PER_ASSET_ATTRIBUTE,
      filterLabelMaxNumber: process.env.MAX_FILTER_PER_ASSET_LABEL,
      searchMaxNumber: process.env.MAX_SEARCH_QUERY_LENGTH,
    },
  };
});
