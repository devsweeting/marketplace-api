/* eslint-disable no-magic-numbers */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CollectionIdDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID(4)
  public id: string;
}
