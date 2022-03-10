import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsEnum, IsOptional, IsString, IsNotEmpty, Min } from 'class-validator';
import { OrderEnum } from 'modules/common/enums/order.enum';

export class ListDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  public page = 1;

  @ApiPropertyOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  public limit = 25;

  @ApiPropertyOptional()
  @IsEnum(OrderEnum)
  public order: OrderEnum = OrderEnum.DESC;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public query?: string;
}
