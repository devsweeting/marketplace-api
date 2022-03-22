import * as common from './common.json';

import * as Asset from './asset.json';
import * as User from './user.json';
import * as Partner from './partner.json';

const enLocale = {
  language: 'en',
  translations: {
    ...common,
    resources: {
      Asset,
      User,
      Partner,
    },
  },
};

export default enLocale;
