import { Token } from 'modules/assets/entities';

export const createToken = (data: Partial<Token>): Promise<Token> => {
  const token = new Token({
    supply: 1,
    ...data,
  });
  return token.save();
};
