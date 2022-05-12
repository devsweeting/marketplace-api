import { Label } from 'modules/assets/entities';

export const createLabel = (data: Partial<Label>): Promise<Label> => {
  const label = new Label({
    name: 'label name',
    value: 'value',
    ...data,
  });
  return label.save();
};
