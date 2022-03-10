import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '../enums/role.enum';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({
    example: 'test@mail.com',
    description: 'The email of the User',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'firstName',
    description: 'The first name of the User',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    example: 'lastName',
    description: 'The last name of the User',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    example: RoleEnum.ADMIN,
    description: 'The role of the User',
    enum: RoleEnum,
  })
  @Transform(({ value }) => value.toUpperCase() as RoleEnum)
  @IsEnum(RoleEnum)
  @IsOptional()
  role?: RoleEnum;

  @ApiProperty({
    example: 'refId',
    description: '',
  })
  @IsOptional()
  @IsString()
  refId: string;
}
