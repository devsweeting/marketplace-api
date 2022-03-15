import * as common from './common.json';

import * as Asset from './asset.json';
import * as User from './user.json';

const enLocale = {
  language: 'en',
  translations: {
    ...common,
    resources: {
      Asset,
      User,
    },
  },
};

export default enLocale;
