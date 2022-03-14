import AdminJS, { OverridableComponent } from 'adminjs';
import path from 'path';

export const bundle = (url: string, componentName?: OverridableComponent): string => {
  return AdminJS.bundle(path.join(__dirname, url), componentName);
};

/**
 * Common components
 */
export const LABELS_COMPONENT = bundle('components/labels.component');
export const SHOW_DELETED_AT = bundle('components/deleted-at-show');
