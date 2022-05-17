import Hashids from 'hashids';

export const encodeHashId = (id: number): string => {
  const hashids = new Hashids();
  return hashids.encode(id);
};

export const decodeHashId = (hash): number => {
  const hashids = new Hashids();
  return Number(hashids.decode(hash)[0]);
};
