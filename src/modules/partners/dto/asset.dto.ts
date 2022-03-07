import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { AttributeDto } from './attribute.dto';
import { ListingDto } from './listing.dto';

export class AssetDto {
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    description: 'Reference ID from the partners system',
    required: true,
    example: '123456789',
  })
  refId: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Auction Type',
    required: true,
  })
  listing: ListingDto;

  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({
    description: 'URI pointing to asset image.  Must be less than 255 characters.',
    required: true,
    example: 'https://picsum.photos/400/200',
  })
  image: string;

  @MaxLength(200)
  @IsUrl()
  @ApiProperty({
    description: 'Link to partners asset page.  Must be less than 200 characters.',
    required: false,
    example: 'https://example.com/nfts/1337',
  })
  externalUrl?: string;

  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({
    description: 'Name of the asset. Must be less than 50 characters.',
    required: true,
    example: 'My Awesome Asset',
  })
  name: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Full description of the asset.',
    required: true,
    example: 'This is a great asset',
  })
  description: string;

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
  attributes: AttributeDto[];
}
