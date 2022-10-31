import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const EARLIEST_DAY_OR_MONTH = 1;
const LAST_DAY = 31;
const LAST_MONTH = 12;
const EARLIEST_YEAR = 1990;
const LAST_YEAR = 2022;

export class DateOfBirthDto {
  @ApiProperty({
    example: '14',
  })
  @IsInt()
  @Min(EARLIEST_DAY_OR_MONTH)
  @Max(LAST_DAY)
  @IsNotEmpty()
  public day: number;

  @ApiProperty({
    example: '2',
  })
  @IsInt()
  @Min(EARLIEST_DAY_OR_MONTH)
  @Max(LAST_MONTH)
  @IsNotEmpty()
  public month: number;

  @ApiProperty({
    example: '1991',
  })
  @IsInt()
  @Min(EARLIEST_YEAR)
  @Max(LAST_YEAR)
  @IsNotEmpty()
  public year: number;
}
