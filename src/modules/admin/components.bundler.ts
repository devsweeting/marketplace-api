import AdminJS, { OverridableComponent } from 'adminjs';
import path from 'path';

export const bundle = (url: string, componentName?: OverridableComponent): string =>
  AdminJS.bundle(path.join(__dirname, `/../${url}.tsx`), componentName);

/**
 * Common components
 */
