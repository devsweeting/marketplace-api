import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsUrl, MaxLength, Validate } from 'class-validator';
import { MediaTypeEnum } from 'modules/assets/enums/media-type.enum';
import { UrlFormatValidator } from 'modules/assets/validators/url-format.validator';

export class MediaDto {
  @IsNotEmpty()
  @MaxLength(200)
  @ApiProperty({
    description: 'Name of the media. Must be less than 200 characters.',
    required: true,
    example: 'My Awesome Media',
  })
  public title: string;

  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    description: 'Full description of the media.',
    required: true,
    example: 'This is a media description',
  })
  public description: string;

  @MaxLength(1024)
  @IsUrl()
  @Validate(UrlFormatValidator)
  @ApiProperty({
    description: 'Link to media url.  Must be less than 1024 characters.',
    required: true,
    example: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
  })
  public sourceUrl: string;

  @ApiProperty({ example: MediaTypeEnum.Image })
  @Transform(({ value }) => value.toUpperCase() as MediaTypeEnum)
  @IsNotEmpty()
  @IsEnum(MediaTypeEnum)
  public type: MediaTypeEnum;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  public sortOrder: number;
}
