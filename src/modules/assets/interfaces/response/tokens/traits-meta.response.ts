import { ApiProperty } from '@nestjs/swagger';

export class TraitsMetaResponse {
  @ApiProperty({ example: '1' })
  public trait_type: string;

  @ApiProperty({ example: '1' })
  public display_type: string;

  @ApiProperty({ example: '1' })
  public value: string;

  //TODO
  // @ApiProperty({ example: '1' })
  // public max_value: string;
}
