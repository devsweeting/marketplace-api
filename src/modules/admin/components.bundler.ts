import AdminJS, { OverridableComponent } from 'adminjs';
import path from 'path';

export const bundle = (url: string, componentName?: OverridableComponent): string => {
  return AdminJS.bundle(path.join(__dirname, url), componentName);
};

/**
 * Common components
 */

export const ATTRIBUTE_COMPONENT = bundle(
  'resources/asset/components/attribute-property.component',
);
export const LABELS_COMPONENT = bundle('resources/asset/components/labels-property.component');
export const SHOW_DELETED_AT = bundle('components/deleted-at-show');
export const FILTER_PROPERTY = bundle('components/filter-property');
export const REFERENCE_FIELD = bundle('components/reference-field');
export const PHOTO_PROPERTY = bundle('components/photo-property');
export const IMAGE_UPLOAD = bundle('components/image-upload');
