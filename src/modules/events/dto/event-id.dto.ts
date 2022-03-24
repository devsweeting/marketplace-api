import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class EventIdDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID(4)
  public id: string;
}