import { useState, useCallback, useEffect } from 'react';
import { Icon, Input, TableCell, TableRow, FormMessage } from '@adminjs/design-system';
import Select from 'react-select';
import { MediaTypeEnum } from 'modules/assets/enums/media-type.enum';
import MediaComponent from './media.component';
import MediaDropZone from './media-drop-zone.component';

const MediaRowComponent = ({ media, where, validation, onDelete, onUpdate, index, errors }) => {
  const [state, setState] = useState({
    type: '',
    url: '',
    title: '',
    file: [],
    sortOrder: '',
    ...media,
  });

  const onUpdateTitle = useCallback((event) => {
    const { value } = event.target;
    setState((media) => {
      return { ...media, title: value };
    });
  }, []);

  const onUpdateType = useCallback((event) => {
    const value = event?.value ?? null;
    setState((media) => {
      return { ...media, type: value };
    });
  }, []);

  const onUpdateImage = useCallback((event) => {
    setState((media) => {
      return { ...media, file: [event[0]] };
    });
  }, []);

  const onUpdateUrl = useCallback((event) => {
    const { value } = event.target;

    setState((media) => {
      return { ...media, url: value };
    });
  }, []);

  const onUpdateOrder = useCallback((event) => {
    const { value } = event.target;
    setState((media) => {
      return { ...media, sortOrder: value };
    });
  }, []);

  useEffect(() => {
    onUpdate(state);
  }, [state]);

  const rowError = errors && errors[index];

  const options: { value: string; label: string }[] = Object.values(MediaTypeEnum).map((el) => {
    return { value: el, label: el.toUpperCase() };
  });

  const selectedOption = (v) =>
    options.find((opt) => opt.value === v) ?? { value: null, label: '' };

  return (
    <TableRow key={index} style={{ paddingBottom: '16px' }}>
      <TableCell>
        {where === 'edit' && (
          <>
            <Select
              options={options}
              value={selectedOption(state.type)}
              onChange={onUpdateType}
              isClearable={true}
            />
            <FormMessage color="error">
              {rowError?.map((el) => (el.field === 'type' ? el.message : null))}
            </FormMessage>
          </>
        )}
        {where === 'show' && state.type}
      </TableCell>
      <TableCell>
        {where === 'edit' && (
          <>
            <Input style={{ width: '100%' }} value={state.title} onChange={onUpdateTitle} />
            <FormMessage color="error">
              {rowError?.map((el) => (el.field === 'title' ? el.message : null))}
            </FormMessage>
          </>
        )}
        {where === 'show' && state.title}
      </TableCell>
      <TableCell>
        {where === 'edit' && (
          <>
            <Input
              style={{ width: '100%' }}
              value={state.url}
              disabled={!!state.id}
              onChange={onUpdateUrl}
            />
            <FormMessage color="error">
              {rowError?.map((el) => (el.field === 'url' ? el.message : null))}
            </FormMessage>
          </>
        )}
        {where === 'show' && state.url}
      </TableCell>
      <TableCell>
        {where === 'edit' && !state.id && (
          <>
            <MediaDropZone
              validation={validation}
              files={state.file}
              onUpdateImage={onUpdateImage}
            ></MediaDropZone>
            <FormMessage color="error">
              {rowError?.map((el) => (el.field === 'file' ? el.message : null))}
            </FormMessage>
          </>
        )}
        {where === 'edit' && state.id && <MediaComponent media={state} />}
        {where === 'show' && <MediaComponent media={state} />}
      </TableCell>
      <TableCell>
        {where === 'edit' && (
          <>
            <Input
              type="number"
              style={{ width: '100%' }}
              value={state.sortOrder}
              onChange={onUpdateOrder}
            />
            <FormMessage color="error">
              {rowError?.map((el) => (el.field === 'sortOrder' ? el.message : null))}
            </FormMessage>
          </>
        )}
        {where === 'show' && state.sortOrder}
      </TableCell>
      {where === 'edit' && (
        <TableCell>
          <Icon icon="TrashCan" onClick={onDelete} />
        </TableCell>
      )}
    </TableRow>
  );
};

export default MediaRowComponent;
