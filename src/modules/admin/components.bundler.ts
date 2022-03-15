import AdminJS, { OverridableComponent } from 'adminjs';
import path from 'path';

export const bundle = (url: string, componentName?: OverridableComponent): string => {
  return AdminJS.bundle(path.join(__dirname, `${url}`), componentName);
};

/**
 * Common components
 */

export const ATTRIBUTE_PROPERTY = bundle('resources/asset/components/attribute-property');
