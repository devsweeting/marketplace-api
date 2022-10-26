/* eslint-disable no-magic-numbers */
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';
import { PaymentTokenEnum } from '../enums/payment-token.enum';

export class EventRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID(4)
  public assetId: string;

  @ApiProperty({ example: PaymentTokenEnum.DAI })
  @IsNotEmpty()
  @IsEnum(PaymentTokenEnum)
  public paymentToken: PaymentTokenEnum;

  @ApiProperty({ example: 'Z3AOYPMG4EAXM3ZISC3356CUF3APWT2HE37URF5PPWDOUCJQYJ6FXXKLQY' })
  @IsString()
  @IsNotEmpty()
  public fromAddress: string;

  @ApiProperty({ example: 'Z3AOYPMG4EAXM3ZISC3356CUF3APWT2HE37URF5PPWDOUCJQYJ6FXXKLQY' })
  @IsString()
  @IsNotEmpty()
  public toAddress: string;

  @ApiProperty({ example: 2 })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  public quantity: number;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  public price: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  public isPrivate: boolean;
}
