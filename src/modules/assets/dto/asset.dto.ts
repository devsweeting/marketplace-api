import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsUrl, MaxLength, ValidateNested } from 'class-validator';
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
  public refId: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Auction Type',
    required: true,
  })
  public listing: ListingDto;

  //TODO
  @IsNotEmpty()
  public image: any;

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
