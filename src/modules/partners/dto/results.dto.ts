import { ApiProperty } from '@nestjs/swagger';

export class ResultsDto {

  @ApiProperty({description: 'HTTP Status code'})
  statusCode: number;

  @ApiProperty({description: 'HTTP Status message'})
  message: string | Array<string>;

}