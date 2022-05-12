import * as common from './common.json';

import * as Asset from './asset.json';
import * as User from './user.json';
import * as Partner from './partner.json';
import * as Event from './event.json';

const enLocale = {
  language: 'en',
  translations: {
    ...common,
    resources: {
      Asset,
      User,
      Partner,
      Event,
    },
  },
};

export default enLocale;
