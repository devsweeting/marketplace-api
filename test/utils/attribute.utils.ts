import { Attribute } from 'modules/assets/entities';

export const createAttribute = (data: Partial<Attribute>): Promise<Attribute> => {
  const attribute = new Attribute({
    trait: 'name',
    value: 'value',
    ...data,
  });
  return attribute.save();
};
