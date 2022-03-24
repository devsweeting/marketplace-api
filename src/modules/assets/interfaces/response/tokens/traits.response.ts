import { ApiProperty } from '@nestjs/swagger';

export class TraitsResponse {
  @ApiProperty({ example: '1' })
  public trait: string;

  @ApiProperty({ example: '1' })
  public display: string;

  @ApiProperty({ example: '1' })
  public value: string;

  //TODO
  // @ApiProperty({ example: '1' })
  // public maxValue: string;
}
