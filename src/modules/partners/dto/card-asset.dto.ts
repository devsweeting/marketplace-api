import { ApiProperty } from '@nestjs/swagger';

export class CardAssetDto {
  @ApiProperty({ description: 'Reference ID from the partners system' })
  public refId: string;

  @ApiProperty({ description: 'Card description' })
  public title: string;

  @ApiProperty({ required: false })
  public subTitle: string;

  @ApiProperty()
  public gradingService: string;

  @ApiProperty()
  public grade: number;

  @ApiProperty()
  public eyeAppealGrade: number;

  @ApiProperty({ description: 'Year(s) card was minted. In format YYYY' })
  public year: number | number[];

  @ApiProperty()
  public imageFront: string;

  @ApiProperty({ required: false })
  public imageBack: string;

  @ApiProperty({ required: false })
  public youtubeKey: string;
}
