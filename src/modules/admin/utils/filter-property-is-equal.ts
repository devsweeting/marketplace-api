import { FilterPropertyProps } from 'adminjs';

/**
 * Function used in React memo to compare if previous property value and next
 * property value are the same.
 *
 * @private
 */
export const filterPropertyIsEqual = (
  prevProps: FilterPropertyProps,
  nextProps: FilterPropertyProps,
): boolean => {
  const prevValue = prevProps.filter[prevProps.property.path];
  const nextValue = nextProps.filter[nextProps.property.path];

  return !nextValue || prevValue === nextValue;
};
