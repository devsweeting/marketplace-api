import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MarketplaceEnum } from 'modules/assets/enums/marketplace.enum';
import { AuctionTypeEnum } from 'modules/assets/enums/auction-type.enum';

export class ListingResponse {
  @ApiProperty({ example: MarketplaceEnum.Jump })
  public marketplace: MarketplaceEnum;

  @ApiPropertyOptional({ example: AuctionTypeEnum.FixedPrice })
  public auctionType?: AuctionTypeEnum;
}
