import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { AttributeDto } from './attribute.dto';
import { ListingDto } from './listing.dto';

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
    description: 'Auction Type',
    required: false,
  })
  @IsOptional()
  public listing?: ListingDto;

  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({
    description: 'URI pointing to asset image.  Must be less than 255 characters.',
    required: false,
    example: 'https://picsum.photos/400/200',
  })
  @IsOptional()
  public image?: string;

  @MaxLength(200)
  @IsUrl()
  @IsOptional()
  @ApiProperty({
    description: 'Link to partners asset page.  Must be less than 200 characters.',
    required: false,
    example: 'https://example.com/nfts/1337',
  })
  public externalUrl?: string;

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
