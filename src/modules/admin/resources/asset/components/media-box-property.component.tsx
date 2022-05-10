import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  FormGroup,
  Label,
  FormMessage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@adminjs/design-system';
import { EditPropertyProps, flat } from 'adminjs';

import MediaRowComponent from './media-row.component';

const MediaBoxComponent: React.FC<EditPropertyProps> = (props) => {
  const { property, onChange, record, where } = props;
  const params = flat.unflatten(record.params);
  const { custom = {} } = property;
  const value = (params && params[property.path]) || [];
  const error = record.errors && record.errors[property.path];
  const mediaError = error?.message && JSON.parse(error.message);
  const [media, setMedia] = useState(value || []);

  const addNewMedia = useCallback(() => {
    setMedia((media) => [...media, { title: '', type: '', url: '', sortOrder: '', file: [] }]);
  }, [media, setMedia]);

  const onDelete = useCallback(
    (index) => {
      setMedia((media) => media.filter((m, i) => i !== index));
    },
    [media, setMedia],
  );

  const onUpdate = useCallback(
    (index) => (partial) => {
      setMedia((media) => {
        const updated = { ...media[index], ...partial };
        return media.map((m, i) => (i === index ? updated : m));
      });
    },
    [],
  );

  if (where === 'edit') {
    useEffect(() => {
      onChange(property.path, media);
    }, [media, onChange]);
  }
  const validation = custom.validation || property.props.validation || null;

  return (
    <FormGroup>
      <Label property={property}>{property.label}</Label>
      <Table style={{ width: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Url</TableCell>
            <TableCell>File</TableCell>
            <TableCell>Sort Order</TableCell>
            {where === 'edit' && <TableCell />}
          </TableRow>
        </TableHead>
        <TableBody>
          {media.length === 0 && (
            <TableRow>
              <TableCell>No media</TableCell>
            </TableRow>
          )}
          {media.length > 0 &&
            media.map((media, index) => (
                <MediaRowComponent
                  media={media}
                  where={where}
                  validation={validation}
                  onDelete={() => onDelete(index)}
                  onUpdate={onUpdate(index)}
                  index={index}
                  errors={mediaError}
                  key={index}
                ></MediaRowComponent>
            ))}
        </TableBody>
      </Table>
      {where === 'edit' && (
        <Button type="button" onClick={addNewMedia} style={{ marginTop: '16px' }}>
          Add new media
        </Button>
      )}
    </FormGroup>
  );
};

export default MediaBoxComponent;
