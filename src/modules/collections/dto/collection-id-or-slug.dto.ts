import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, NotContains } from 'class-validator';

export class CollectionIdOrSlugDto {
  @ApiProperty()
  @IsNotEmpty()
  @NotContains(' ', { message: 'Should NOT contain any whitespace.' })
  @IsString()
  public collectionParams: string;
}
