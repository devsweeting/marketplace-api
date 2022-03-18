import { memo } from 'react';
import { DropZone, FormGroup, Label } from '@adminjs/design-system';

function ImageUpload(props) {
  const { property, onChange, record } = props;
  const { custom = {} } = property;

  const imageUpload = record.params[property.path];
  const { isMultiUpload = false } = custom;
  let files = imageUpload ? [imageUpload] : [];
  if (isMultiUpload) {
    files = imageUpload || [];
  }

  const handleChange = (f) => {
    let filesToUpload = f.length ? f[0] : '';
    if (isMultiUpload) filesToUpload = f.length ? f : '';
    onChange(property.path, filesToUpload);
  };

  const validation = custom.validation || property.props.validation || null;

  return (
    <FormGroup>
      <Label>{property.label}</Label>
      <DropZone
        validate={validation}
        files={files}
        onChange={handleChange}
        multiple={isMultiUpload}
      />
    </FormGroup>
  );
}

export default memo(
  ImageUpload,
  (prevProps, nextProps) =>
    prevProps.record.params.imageUpload === nextProps.record.params.imageUpload,
);
