/* eslint-disable no-magic-numbers */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, MaxLength, ValidateNested } from 'class-validator';
import { AttributeDto } from './attribute.dto';
import { MediaDto } from './media/media.dto';

export class UpdateAssetDto {
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    description: 'Reference ID from the partners system',
    required: false,
    example: '123456789',
  })
  @IsOptional()
  public refId?: string;

  @IsNotEmpty()
  @ApiProperty({
    type: [MediaDto],
    description: 'Media for asset',
    required: false,
  })
  @IsOptional()
  public media?: MediaDto[];

  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({
    description: 'Name of the asset. Must be less than 50 characters.',
    required: true,
    example: 'My Awesome Asset',
  })
  @IsOptional()
  public name?: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Full description of the asset.',
    required: true,
    example: 'This is a great asset',
  })
  @IsOptional()
  public description?: string;

  @ApiProperty({
    description: 'Array of attributes defining the characteristics of the asset.',
    type: [AttributeDto],
    example: [
      {
        trait: 'Year',
        value: '1980',
        display: 'number',
      },
      {
        trait: 'Category',
        value: 'Baseball',
      },
      {
        trait: 'Date Minted',
        value: '1546360800',
        display: 'date',
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => AttributeDto)
  public attributes: AttributeDto[];
}
