import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum } from 'class-validator';

const markets = ['Jump', 'OpenSea'];
const auctionTypes = ['FixedPrice'];

export class ListingDto {
  @IsNotEmpty()
  @IsEnum(markets)
  @ApiProperty({
    description: 'Marketplace to list asset on.',
    required: true,
    enum: markets,
  })
  public marketplace: string;

  @IsNotEmpty()
  @IsEnum(auctionTypes)
  @ApiProperty({
    description: 'Auction Type',
    required: false,
    enum: auctionTypes,
  })
  public auctionType?: string;
}
