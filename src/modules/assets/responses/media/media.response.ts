import { ApiProperty } from '@nestjs/swagger';

export class MediaResponse {
  @ApiProperty()
  public id: string;

  @ApiProperty({ example: 'Test asset name' })
  public title: string;

  @ApiProperty({
    example:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  })
  public description: string;

  @ApiProperty({ example: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Test-Logo.svg' })
  public sourceUrl: string;

  @ApiProperty({ example: '5c2481c4-c622-48a3-ae6d-657097c3d5e7' })
  public assetId: string;

  @ApiProperty({ example: '5c2481c4-c622-48a3-ae6d-657097c3d5e7' })
  public fileId: string | null;

  @ApiProperty({
    example: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Test-Logo.svg',
    description: 'file url from the storage',
  })
  public file: string | null;

  @ApiProperty({ example: 1 })
  public sortOrder: number;

  // Shouldn't be exposed to the client on POST/PUT/PATCH
  public absoluteUrl: string | null;
}
