import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class StripePurchaseDetailsDto {
  @ApiProperty({
    example: '123-abc',
  })
  @IsString()
  @IsNotEmpty()
  public intentId: string;

  @ApiProperty({
    example: 'succeeded',
  })
  @IsString()
  @IsNotEmpty()
  public purchaseStatus: string;

  @ApiProperty({
    description: 'Stripe currency in dollars',
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
