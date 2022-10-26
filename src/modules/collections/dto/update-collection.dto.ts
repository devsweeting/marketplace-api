/* eslint-disable no-magic-numbers */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class UpdateCollectionDto {
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({
    description: 'Name of the collection. Must be less than 50 characters.',
    required: true,
    example: 'My Awesome Collection',
  })
  @IsOptional()
  public name?: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Full description of the collection.',
    required: true,
    example: 'This is a great collection',
  })
  @IsOptional()
  public description?: string;

  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({
    description: 'URI pointing to collection banner.  Must be less than 255 characters.',
    required: false,
    example: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
  })
  @IsOptional()
  public banner?: string;
}
