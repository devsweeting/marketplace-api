import { ApiProperty } from '@nestjs/swagger';
import { MediaResponse } from '../media/media.response';
import { TraitsResponse } from './traits.response';

export class TokenResponse {
  @ApiProperty({ type: [MediaResponse] })
  public media: MediaResponse[];

  @ApiProperty({ example: 'Test asset name' })
  public name: string;

  @ApiProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  })
  public description: string;

  @ApiProperty()
  public traits: TraitsResponse[];
}
