import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  FormGroup,
  Label,
  DropZone,
  Icon,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@adminjs/design-system';
import { EditPropertyProps, flat } from 'adminjs';
import Select from 'react-select';
import { MediaTypeEnum } from 'modules/assets/enums/media-type.enum';
import MediaComponent from './media.component';

const MediaBoxComponent: React.FC<EditPropertyProps> = (props) => {
  const { property, onChange, record, where } = props;
  const params = flat.unflatten(record.params);
  const { custom = {} } = property;
  const value = (params && params[property.path]) || [];
  const error = record.errors && record.errors[property.path];

  const [media, setMedia] = useState(value || []);

  const addNewMedia = useCallback(() => {
    setMedia((media) => [...media, { title: '', type: '', url: '', sortOrder: '', file: null }]);
  }, [media, setMedia]);

  const onDelete = useCallback(
    (index) => {
      setMedia((media) => media.filter((m, i) => i !== index));
    },
    [media, setMedia],
  );

  const onUpdate = useCallback((index, partial) => {
    const updated = { ...media[index], ...partial };
    setMedia((media) => media.map((m, i) => (i === index ? updated : m)));
  }, []);

  const options: { value: string; label: string }[] = Object.values(MediaTypeEnum).map((el) => {
    return { value: el, label: el.toUpperCase() };
  });

  const selectedOption = (v) =>
    options.find((opt) => opt.value === v) ?? { value: null, label: '' };

  if (where === 'edit') {
    useEffect(() => {
      onChange(property.path, media);
    }, [media, onChange]);
  }
  const validation = custom.validation || property.props.validation || null;

  return (
    <FormGroup error={!!error} style={{ marginTop: '16px' }}>
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
              <TableRow key={index}>
                <TableCell>
                  {where === 'edit' && (
                    <Select
                      options={options}
                      value={selectedOption(media.type)}
                      onChange={(event) => onUpdate(index, { type: event?.value ?? null })}
                      isClearable={true}
                    />
                  )}
                  {where === 'show' && media.type}
                </TableCell>
                <TableCell>
                  {where === 'edit' && (
                    <Input
                      style={{ width: '100%' }}
                      value={media.title}
                      onChange={(event) => onUpdate(index, { title: event.target.value })}
                    />
                  )}
                  {where === 'show' && media.title}
                </TableCell>
                <TableCell>
                  {where === 'edit' && (
                    <Input
                      style={{ width: '100%' }}
                      value={media.url}
                      disabled={!!media.id}
                      onChange={(event) => onUpdate(index, { url: event.target.value })}
                    />
                  )}
                  {where === 'show' && media.url}
                </TableCell>
                <TableCell>
                  {where === 'edit' && !media.id && (
                    <>
                      <DropZone
                        validate={validation}
                        files={[media.file]}
                        onChange={(f) => onUpdate(index, { file: f[0] })}
                      />
                    </>
                  )}
                  {where === 'edit' && media.id && <MediaComponent media={media} />}
                  {where === 'show' && <MediaComponent media={media} />}
                </TableCell>
                <TableCell>
                  {where === 'edit' && (
                    <Input
                      type="number"
                      style={{ width: '100%' }}
                      value={media.sortOrder}
                      onChange={(event) => onUpdate(index, { sortOrder: event.target.value })}
                    />
                  )}
                  {where === 'show' && media.sortOrder}
                </TableCell>
                {where === 'edit' && (
                  <TableCell>
                    <Icon icon="TrashCan" onClick={() => onDelete(index)} />
                  </TableCell>
                )}
              </TableRow>
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
