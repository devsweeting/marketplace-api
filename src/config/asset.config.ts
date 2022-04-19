import { registerAs } from '@nestjs/config';

export default registerAs('asset', () => {
  return {
    default: {
      maxMediaNumber: process.env.MAX_MEDIA_PER_ASSET,
      filterAttributeMaxNumber: process.env.MAX_FILTER_PER_ASSET_ATTRIBUTE,
      filterLabelMaxNumber: process.env.MAX_FILTER_PER_ASSET_LABEL,
      searchMaxNumber: process.env.MAX_SEARCH_NUMBER_PER_ASSET,
    },
  };
});
