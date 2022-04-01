import { Attribute } from 'modules/assets/entities';

export const createAttribute = (data: Partial<Attribute>): Promise<Attribute> => {
  const attribute = new Attribute({
    trait: 'trait name',
    value: 'value',
    display: 'text',
    ...data,
  });
  return attribute.save();
};
