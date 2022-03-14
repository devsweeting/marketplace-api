import AdminJS, { OverridableComponent } from 'adminjs';
import path from 'path';

const extComponent = process.env.NODE_ENV == 'test' ? '.tsx' : '.js';

export const bundle = (url: string, componentName?: OverridableComponent): string => {
  return AdminJS.bundle(path.join(__dirname, `${url}${extComponent}`), componentName);
};

/**
 * Common components
 */

export const SHOW_DELETED_AT = bundle('components/deleted-at-show');
