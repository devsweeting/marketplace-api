import { ApiProperty } from '@nestjs/swagger';

export class FileResponse {
  @ApiProperty({ example: 'Meet-background-Grey-Map.jpg' })
  public name: string;

  @ApiProperty({ example: 'http://localhost:4566/test-bucket/Meet-background-Grey-Map.jpg' })
  public url: string;

  @ApiProperty({ example: 'image/jpeg' })
  public mimeType: string;
}
