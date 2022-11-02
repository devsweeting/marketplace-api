/* eslint-disable no-magic-numbers */
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VerifyAddressDto } from './verify-address.dto';
import { DateOfBirthDto } from './date-of-birth.dto';
import { Type } from 'class-transformer';

export class CreateAccountDto {
  @ApiProperty({
    example: 'Lebron',
  })
  @IsString()
  @IsNotEmpty()
  public first_name: string;

  @ApiProperty({
    example: 'James',
  })
  @IsString()
  @IsNotEmpty()
  public last_name: string;

  @ApiProperty({
    example: 'test@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({
    example: '123.456.7890',
  })
  @IsPhoneNumber('US')
  @IsNotEmpty()
  public phone_numbers: string;

  @ApiProperty({
    example: 'M',
  })
  @IsOptional()
  public gender?: 'M' | 'F' | 'O';

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => VerifyAddressDto)
  public mailing_address: VerifyAddressDto;

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DateOfBirthDto)
  public date_of_birth: DateOfBirthDto;
}
