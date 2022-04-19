import { memo, useState, useEffect } from 'react';
import { DropZone, FormGroup, Label, FormMessage, DropZoneItem } from '@adminjs/design-system';
import { flat, useTranslation } from 'adminjs';

const propertyToFiles = (propertyValue) => {
  if (!propertyValue) return [];

  if (Array.isArray(propertyValue)) return propertyValue;
  return [propertyValue];
};

function ImageUpload(props) {
  const { property, onChange, record, where } = props;
  const { custom = {} } = property;
  const { isMultiUpload = false } = custom;
  const { translateMessage: tm } = useTranslation();
  const error = record.errors[property.name];

  const [files, setFiles] = useState([]);
  const fileUpload = flat.get(record.params, property.path);

  useEffect(() => {
    setFiles(propertyToFiles(fileUpload));
  }, []);

  const handleChange = (f) => {
    let filesToUpload = f.length ? f[0] : '';
    if (isMultiUpload && f.length) {
      const newFiles = f.filter(
        (file) =>
          !files.some(
            (existingFile) => existingFile.key === file.name || existingFile.name === file.name,
          ),
      );
      filesToUpload = [...files, ...newFiles];
    }
    setFiles(filesToUpload);
    onChange(property.path, filesToUpload);
  };

  const removeItem = (index) => {
    const isSure = window.confirm(tm('areYouSureToRemove'));
    if (!isSure) return;

    const newItems = [...files];
    newItems.splice(index, 1);

    if (isMultiUpload) {
      setFiles(newItems);

      return onChange(property.path, newItems);
    }

    setFiles(newItems);

    onChange(property.path, newItems[0] ?? null);
  };

  const validation = custom.validation || property.props.validation || null;

  const filesPreview = Array.isArray(files) ? files : [files];

  return (
    <FormGroup error={!!error}>
      <Label>{property.label}</Label>
      {where === 'edit' && (
        <>
          <DropZone
            validate={validation}
            files={[]}
            onChange={handleChange}
            multiple={isMultiUpload}
          />
          {filesPreview.map((file, index) => (
            <DropZoneItem
              onRemove={() => removeItem(index)}
              src={file.path}
              file={file}
              filename={file.name}
              key={`${file.id}-${index}`}
            />
          ))}
        </>
      )}
      {error && <FormMessage color="error">{error.message}</FormMessage>}
    </FormGroup>
  );
}

export default memo(
  ImageUpload,
  (prevProps, nextProps) =>
    prevProps.record.params.imageUpload === nextProps.record.params.imageUpload,
);
