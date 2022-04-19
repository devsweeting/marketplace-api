import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class CollectionDto {
  @IsNotEmpty()
  @MaxLength(200)
  @ApiProperty({
    description: 'Name of the collection. Must be less than 200 characters.',
    required: true,
    example: 'My Awesome Collection',
  })
  public name: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Full description of the collection.',
    required: true,
    example: 'This is a great collection',
  })
  public description: string;

  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({
    description: 'URI pointing to collection banner.  Must be less than 255 characters.',
    required: false,
    example: 'https://picsum.photos/400/200',
  })
  public banner: any;
}
