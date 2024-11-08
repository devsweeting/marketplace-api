import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class PurchaseHistoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID(4)
  public assetId: string;
}
