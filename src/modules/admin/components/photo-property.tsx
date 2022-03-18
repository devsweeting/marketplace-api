import React from 'react';
import { BasePropertyProps, flat } from 'adminjs';
import { Label, Box } from '@adminjs/design-system';
import PhotoImgComponent from './photo-img';

const PhotoProperty: React.FC<BasePropertyProps> = ({ property, record, where }) => {
  const { [property.propertyPath]: file } = flat.unflatten(record.params);

  return (
    <Box mb="xl">
      {where === 'show' && <Label>{property?.props?.label || property.label}</Label>}
      <PhotoImgComponent path={file?.path} alt={file?.name} width="200px" />
    </Box>
  );
};

export default PhotoProperty;