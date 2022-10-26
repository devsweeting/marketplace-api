import { Attribute } from 'modules/assets/entities';

export const AUTH_UNAUTHORIZED = '{"statusCode":401,"message":"Unauthorized"}';

export const filterAttributes = (
  attributes: Partial<Attribute>[],
  assetId: string,
): Partial<Attribute>[] => {
  return attributes.filter((el) => el.assetId === assetId);
};
