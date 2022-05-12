import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CollectionDto {
  @ApiProperty({
    description: 'Collection record id',
    example: '123456789',
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  public id: string;

  @ApiProperty({
    description: 'Collection slug',
    example: 'slug',
  })
  @IsString()
  @IsOptional()
  public slug: string;
}
