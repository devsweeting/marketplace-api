import React from 'react';
import { FilterPropertyProps, flat } from 'adminjs';
import Select from 'react-select/async';
import { Box, Label } from '@adminjs/design-system';
import { filterPropertyIsEqual } from '../utils/filter-property-is-equal';
import { useFetchOptions } from '../hooks/useFetchOptions';

const CustomFilterProperty: React.FC<FilterPropertyProps> = (props) => {
  const { property, record, filter, onChange } = props;

  const { custom = {} } = property;

  const selectedRaw = flat.get(filter, property.path) ?? [];
  const selectedIds = Array.isArray(selectedRaw) ? selectedRaw : selectedRaw.split(',');

  const { search, selected } = useFetchOptions({
    filters: {},
    property,
    record,
    searchProperty: custom.searchProperty,
    resourceId: custom.resourceId,
    selectedIds,
    currentResource: null,
    searchAction: 'list',
  });

  const handleChange = (values): void => {
    onChange(property.path, Array.isArray(values) ? values.map((value) => value.id) : []);
  };

  return (
    <Box mb={16}>
      <Label>{property.label}</Label>
      <Select
        value={selected}
        cacheOptions
        styles={{
          control: (base, state) => ({
            ...base,
            backgroundColor: 'transparent',
            borderRadius: 0,
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: state.isFocused ? '0 1px 4px 0 rgb(56 202 241 / 58%)' : null,
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: '#343F87',
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected || state.isFocused ? '#2f3874' : 'transparent',
          }),
          input: (base) => ({
            ...base,
            color: 'white',
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: '#2f3874',
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: 'white',
          }),
        }}
        loadOptions={(input, callback) => {
          search(input).then(callback);
        }}
        onChange={handleChange}
        getOptionLabel={(option) => option.params[custom.searchProperty]}
        getOptionValue={(option) => option.params.id}
        isMulti={1}
        isClearable
        defaultOptions
      />
    </Box>
  );
};

export default React.memo(CustomFilterProperty, filterPropertyIsEqual);
