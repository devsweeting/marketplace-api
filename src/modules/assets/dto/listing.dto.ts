import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MarketplaceEnum } from 'modules/assets/enums/marketplace.enum';
import { AuctionTypeEnum } from 'modules/assets/enums/auction-type.enum';

export class ListingDto {
  @IsNotEmpty()
  @IsEnum(MarketplaceEnum)
  @ApiProperty({
    description: 'Marketplace to list asset on.',
    required: true,
    enum: MarketplaceEnum,
  })
  public marketplace: MarketplaceEnum;

  @IsNotEmpty()
  @IsEnum(AuctionTypeEnum)
  @ApiProperty({
    description: 'Auction Type',
    required: false,
    enum: AuctionTypeEnum,
  })
  public auctionType?: AuctionTypeEnum;
}
