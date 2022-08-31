import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshRequestDto {
  @ApiProperty({
    example: 'Im_a_duck',
    description: 'refresh token',
  })
  @IsNotEmpty({ message: 'Refresh token is required' })
  public refreshToken: string;
}
