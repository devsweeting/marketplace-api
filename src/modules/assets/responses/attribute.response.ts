import { ApiProperty } from '@nestjs/swagger';

export class AttributeResponse {
  @ApiProperty()
  public trait: string;

  @ApiProperty()
  public value: string;

  @ApiProperty()
  public display: string;
}
