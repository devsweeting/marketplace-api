import { ApiProperty } from '@nestjs/swagger';
import { MediaResponse } from '../media/media.response';
import { TraitsMetaResponse } from './traits-meta.response';

// This endpoint must conform to the following interface:
// https://eips.ethereum.org/EIPS/eip-1155
export class TokenMetaResponse {
  @ApiProperty({ type: [MediaResponse] })
  public media: MediaResponse[];

  @ApiProperty({ example: 'Test asset name' })
  public name: string;

  @ApiProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  })
  public description: string;

  @ApiProperty({ type: TraitsMetaResponse })
  public properties: TraitsMetaResponse[];
}
