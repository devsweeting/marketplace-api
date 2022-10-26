import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class WatchlistIdDto {
  @ApiProperty()
  @IsNotEmpty()
  // eslint-disable-next-line no-magic-numbers
  @IsUUID(4)
  public assetId: string;
}
