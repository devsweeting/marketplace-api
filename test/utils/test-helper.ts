import { Attribute } from 'modules/assets/entities';
import { createAttribute } from './attribute.utils';

export const AUTH_UNAUTHORIZED = '{"statusCode":401,"message":"Unauthorized"}';

export const createAttributes = async (array: Partial<Attribute>[]) => {
  const attr = [];
  for (const el of array) {
    attr.push(await createAttribute({ ...el }));
  }
  return attr;
};

export const filterAttributes = (attributes: Partial<Attribute>[], assetId: string) => {
  return attributes.filter((el) => el.assetId === assetId);
};
