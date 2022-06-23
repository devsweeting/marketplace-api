import { Asset, Token } from 'modules/assets/entities';
import { DeleteResult } from 'typeorm';

export const deleteToken = (asset: Asset): Promise<DeleteResult> => {
  return Token.delete({ assetId: asset.id });
};

export const createToken = (data: Partial<Token>): Promise<Token> => {
  const token = new Token({
    ...data,
  });
  return token.save();
};
