import React, { useCallback, useState, useEffect } from 'react';
import Select from 'react-select';
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
import { displayTypes } from 'modules/assets/enums/display-type.enum';

const AttributeComponent: React.FC<EditPropertyProps> = (props) => {
  const { property, onChange, record, where } = props;
  const params = flat.unflatten(record.params);
  const value = (params && params[property.path]) || [];
  const error = record.errors && record.errors[property.path];
  const [attributes, setAttributes] = useState(value || []);

  const options: { value: string; label: string }[] = displayTypes.map((el) => {
    return { value: el, label: el };
  });

  const addNewAttribute = useCallback(() => {
    setAttributes((attr) => [...attr, { trait: '', value: '', display: '' }]);
  }, [attributes, setAttributes]);

  const onDelete = useCallback(
    (index) => {
      setAttributes((attributes) => attributes.filter((_attr, i) => i !== index));
    },
    [attributes, setAttributes],
  );

  const onUpdate = useCallback(
    (index, partial) => {
      const updated = { ...attributes[index], ...partial };
      setAttributes((attributes) => attributes.map((attr, i) => (i === index ? updated : attr)));
    },
    [attributes, setAttributes, onChange],
  );

  if (where === 'edit') {
    useEffect(() => {
      onChange(property.path, attributes);
    }, [attributes, onChange]);
  }

  const selectedOption = (v) =>
    options.find((opt) => opt.value === v) ?? { value: null, label: '' };

  return (
    <FormGroup error={!!error} style={{ marginTop: '16px' }}>
      <Label property={property}>{property.label}</Label>
      <Table style={{ width: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell>Trait</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Display</TableCell>
            {where === 'edit' && <TableCell />}
          </TableRow>
        </TableHead>
        <TableBody>
          {attributes.length === 0 && (
            <TableRow>
              <TableCell>No attributes</TableCell>
            </TableRow>
          )}
          {attributes.length > 0 &&
            attributes.map((attr, index) => (
              <TableRow key={index}>
                <TableCell>
                  {where === 'edit' && (
                    <Input
                      style={{ width: '100%' }}
                      value={attr.trait}
                      onChange={(event) => onUpdate(index, { trait: event.target.value })}
                    />
                  )}
                  {where === 'show' && attr.trait}
                </TableCell>
                <TableCell>
                  {where === 'edit' && (
                    <Input
                      style={{ width: '100%' }}
                      value={attr.value}
                      onChange={(event) => onUpdate(index, { value: event.target.value })}
                    />
                  )}
                  {where === 'show' && attr.value}
                </TableCell>
                <TableCell>
                  {where === 'edit' && (
                    <Select
                      options={options}
                      value={selectedOption(attr.display)}
                      onChange={(event) => onUpdate(index, { display: event.value })}
                    />
                  )}
                  {where === 'show' && attr.display}
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
        <Button type="button" onClick={addNewAttribute} style={{ marginTop: '16px' }}>
          Add new Attributes
        </Button>
      )}
    </FormGroup>
  );
};

export default AttributeComponent;
