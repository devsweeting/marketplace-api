import { ApiProperty } from '@nestjs/swagger';

export class AssetLabelResponse {
  @ApiProperty()
  public name: string;

  @ApiProperty()
  public value: string;
}
