import { Partner } from 'modules/partners/entities';

export const createPartner = (data: Partial<Partner>): Promise<Partner> => {
  const partner = new Partner({
    name: 'Test partner',
    ...data,
  });
  return partner.save();
};
