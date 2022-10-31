import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

//Range of dates allowed
const EARLIEST_DAY_OR_MONTH = 1;
const LATEST_DAY = 31;
const LATEST_MONTH = 12;
const EARLIEST_YEAR = 1900;
const LASTEST_YEAR = 2022;

export class DateOfBirthDto {
  @ApiProperty({
    example: '14',
  })
  @IsInt()
  @Min(EARLIEST_DAY_OR_MONTH)
  @Max(LATEST_DAY)
  @IsNotEmpty()
  public day: number;

  @ApiProperty({
    example: '2',
  })
  @IsInt()
  @Min(EARLIEST_DAY_OR_MONTH)
  @Max(LATEST_MONTH)
  @IsNotEmpty()
  public month: number;

  @ApiProperty({
    example: '1991',
  })
  @IsInt()
  @Min(EARLIEST_YEAR)
  @Max(LASTEST_YEAR)
  @IsNotEmpty()
  public year: number;
}
