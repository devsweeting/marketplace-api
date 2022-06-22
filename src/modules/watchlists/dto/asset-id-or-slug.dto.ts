import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, NotContains } from 'class-validator';

export class AssetIdOrSlugDto {
  @ApiProperty()
  @IsNotEmpty()
  @NotContains(' ', { message: 'Should NOT contain any whitespace.' })
  @IsString()
  public checkParams: string;
}
