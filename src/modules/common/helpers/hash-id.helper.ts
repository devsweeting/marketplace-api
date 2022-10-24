import Hashids from 'hashids';

export const encodeHashId = (id: string, salt = null): string => {
  const hashids = salt ? new Hashids(salt) : new Hashids();
  return hashids.encodeHex(id.replace(/-/g, ''));
};

export const decodeHashId = (hash: string, salt = null): string => {
  const hashids = salt ? new Hashids(salt) : new Hashids();
  return hashids.decodeHex(hash).replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};
