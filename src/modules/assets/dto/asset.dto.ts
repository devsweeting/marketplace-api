import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, MaxLength, ValidateNested } from 'class-validator';
import { AttributeDto } from './attribute.dto';
import { MediaDto } from './media/media.dto';

export class AssetDto {
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    description: 'Reference ID from the partners system',
    required: true,
    example: '123456789',
  })
  public refId: string;

  @IsNotEmpty()
  @MaxLength(1024)
  @ApiProperty({
    description: 'URI pointing to asset image.  Must be less than 1024 characters.',
    required: false,
    example: 'https://picsum.photos/400/200',
  })
  @IsOptional()
  public image: any;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Media for asset',
    required: false,
  })
  @IsOptional()
  public media?: MediaDto[];

  @IsNotEmpty()
  @MaxLength(200)
  @ApiProperty({
    description: 'Name of the asset. Must be less than 50 characters.',
    required: true,
    example: 'My Awesome Asset',
  })
  public name: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Full description of the asset.',
    required: true,
    example: 'This is a great asset',
  })
  public description: string;

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
