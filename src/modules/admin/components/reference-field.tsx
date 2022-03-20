import { Box, FormGroup, FormMessage, Label } from '@adminjs/design-system';
import { flat } from 'adminjs';
import Select from 'react-select/async';

import CleanPropertyComponent from './CleanPropertyComponent';
import { useFetchOptions } from './../hooks/useFetchOptions';

const SingleReferenceEdit = (props) => {
  const { property, record, onChange, resource, where } = props;
  const { custom } = property;
  const {
    filters = {},
    searchProperty = 'name',
    resourceId = property.reference,
    excludeOptions,
    searchAction = 'list',
  } = custom;

  if (!resourceId) {
    throw new Error(
      'ReferenceField component must either be used on a reference field or be passed `resourceId` custom prop.',
    );
  }

  const isMulti = property.isArray;
  const selectedRaw = flat.get(record.params, property.path);
  const selectedIds = Array.isArray(selectedRaw) ? selectedRaw : [selectedRaw].filter(Boolean);

  const { search, error, selected } = useFetchOptions({
    filters,
    property,
    record,
    searchProperty,
    resourceId,
    selectedIds,
    currentResource: resource.id,
    searchAction,
  });

  const handleChange = (type) => {
    if (!type) {
      onChange(property.path, null);
    } else if (Array.isArray(type)) {
      onChange(
        property.path,
        type.map((t) => t.id),
      );
    } else {
      onChange(property.path, type.id);
    }
  };

  const actualSelected = isMulti ? selected : selected[0] || null;

  return (
    <FormGroup>
      <Label htmlFor={property.path}>{property.label}</Label>
      {where === 'edit' && (
        <Select
          value={actualSelected}
          cacheOptions
          loadOptions={(input, callback) => {
            search(input).then(callback);
          }}
          filterOption={
            excludeOptions
              ? (option) =>
                  !excludeOptions.some((excludeCriteria) =>
                    excludeCriteria.values.includes(option.data.params[excludeCriteria.key]),
                  )
              : null
          }
          onChange={handleChange}
          isDisabled={property.isDisabled}
          getOptionLabel={(option) =>
            option.params[searchProperty] ? option.params[searchProperty] : option[searchProperty]
          }
          getOptionValue={(option) => option.id}
          defaultOptions
          isMulti={isMulti || false}
          isClearable
          {...property.props}
        />
      )}
      {where === 'show' &&
        selected.map((option, index) => (
          <Box mb={10} key={`${option && option.title ? option.title : 'unknown'}-${index}`}>
            <p>{option?.params[searchProperty] ?? option?.title}</p>
          </Box>
        ))}
      <FormMessage color="error">{error}</FormMessage>
    </FormGroup>
  );
};

const ReferenceField = (props) => {
  const { where } = props;

  if (where === 'edit' || where === 'show') {
    return <SingleReferenceEdit {...props} />;
  }

  return <CleanPropertyComponent {...props} />;
};

export default ReferenceField;
