import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { MediaTypeEnum } from 'modules/assets/enums/media-type.enum';

export class UpdateMediaDto {
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({
    description: 'Name of the media. Must be less than 50 characters.',
    required: true,
    example: 'My Awesome Asset',
  })
  @IsOptional()
  public title: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Full description of the media.',
    required: true,
    example: 'This is a media',
  })
  @IsOptional()
  public description: string;

  @MaxLength(1024)
  @IsUrl()
  @ApiProperty({
    description: 'Link to media url.  Must be less than 1024 characters.',
    required: true,
    example: 'https://picsum.photos/400/200',
  })
  @IsOptional()
  public url: string;

  @ApiProperty({ example: MediaTypeEnum.Image })
  @IsNotEmpty()
  @IsEnum(MediaTypeEnum)
  @IsOptional()
  public type: MediaTypeEnum;

  @ApiProperty({ example: 1 })
  @IsOptional()
  public sortOrder: number;
}
