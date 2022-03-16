import React, { useCallback, useState, useEffect } from 'react';
import {
  Label,
  FormGroup,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Input,
  Icon,
} from '@adminjs/design-system';
import { EditPropertyProps, flat } from 'adminjs';

const LabelComponent: React.FC<EditPropertyProps> = (props) => {
  const { property, onChange, record, where } = props;
  const params = flat.unflatten(record.params);
  const value = (params && params[property.path]) || [];
  const error = record.errors && record.errors[property.path];
  const [labels, setLabels] = useState(value || []);

  const addNewLabel = useCallback(() => {
    setLabels((labels) => [...labels, { name: '', value: '' }]);
  }, [labels, setLabels]);

  const onDelete = useCallback(
    (index) => {
      setLabels((labels) => labels.filter((label, i) => i !== index));
    },
    [labels, setLabels],
  );

  const onUpdate = useCallback(
    (index, partial) => {
      const updated = { ...labels[index], ...partial };
      setLabels((labels) => labels.map((label, i) => (i === index ? updated : label)));
    },
    [labels, setLabels, onChange],
  );

  if (where === 'edit') {
    useEffect(() => {
      onChange(property.path, labels);
    }, [labels, onChange]);
  }

  return (
    <FormGroup error={!!error}>
      <Label property={property}>{property.label}</Label>
      <Table style={{ width: '50%' }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Value</TableCell>
            {where === 'edit' && <TableCell />}
          </TableRow>
        </TableHead>
        <TableBody>
          {labels.length === 0 && (
            <TableRow>
              <TableCell>No labels</TableCell>
            </TableRow>
          )}
          {labels.length > 0 &&
            labels.map((label, index) => (
              <TableRow key={index}>
                <TableCell>
                  {where === 'edit' && (
                    <Input
                      style={{ width: '100%' }}
                      value={label.name}
                      onChange={(event) => onUpdate(index, { name: event.target.value })}
                    />
                  )}
                  {where === 'show' && label.name}
                </TableCell>
                <TableCell>
                  {where === 'edit' && (
                    <Input
                      style={{ width: '100%' }}
                      value={label.value}
                      onChange={(event) => onUpdate(index, { value: event.target.value })}
                    />
                  )}
                  {where === 'show' && label.value}
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
        <Button type="button" onClick={addNewLabel}>
          Add new label
        </Button>
      )}
    </FormGroup>
  );
};

export default LabelComponent;
