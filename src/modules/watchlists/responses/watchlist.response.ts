import { ApiProperty } from '@nestjs/swagger';
import { AttributeResponse } from 'modules/assets/responses/attribute.response';
import { MediaResponse } from 'modules/assets/responses/media/media.response';

export class WatchlistAssetResponse {
  @ApiProperty({ example: '1' })
  public id: string;

  @ApiProperty({ example: '5c2481c4-c622-48a3-ae6d-657097c3d5e7' })
  public refId: string;

  @ApiProperty({ example: 'Test asset name' })
  public name: string;

  @ApiProperty({
    type: [MediaResponse],
    description: 'Media for asset',
  })
  public media: MediaResponse[];

  @ApiProperty({ example: 'test-asset-name' })
  public slug: string;

  @ApiProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  })
  public description: string;

  @ApiProperty({ example: '2022-03-09T09:05:34.176Z' })
  public updatedAt: string;

  @ApiProperty({ example: '2022-03-09T09:05:34.176Z' })
  public createdAt: string;

  @ApiProperty({ isArray: true, type: [AttributeResponse] })
  public attributes: AttributeResponse[];

  @ApiProperty({ example: ' A6t1tQ', description: 'Hashed id for partner' })
  public partner: string;
}
