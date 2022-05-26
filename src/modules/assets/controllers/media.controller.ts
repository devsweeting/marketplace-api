import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBasicAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetPartner } from 'modules/auth/decorators/get-partner.decorator';
import { Partner } from 'modules/partners/entities';
import { MediaIdDto } from '../dto/media/media-id.dto';
import { UpdateMediaDto } from '../dto/media/update-media.dto';
import { MediaResponse } from '../responses/media/media.response';
import { MediaService } from '../services/media.service';
import { MediaTransformer } from '../transformers/media.transformer';

@ApiTags('media')
@Controller({
  version: '1',
  path: 'media',
})
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly mediaTransformer: MediaTransformer,
  ) {}

  @Patch(':id')
  @ApiBasicAuth('api-key')
  @UseGuards(AuthGuard('headerapikey'))
  @ApiOperation({ summary: 'Update a media' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Media updated',
  })
  @ApiNotFoundResponse({
    description: 'Media not found',
  })
  @HttpCode(HttpStatus.OK)
  public async update(
    @GetPartner() partner: Partner,
    @Param() params: MediaIdDto,
    @Body() dto: UpdateMediaDto,
  ): Promise<MediaResponse> {
    const media = await this.mediaService.updateMedia(partner, params.id, dto);

    return this.mediaTransformer.transform(media);
  }

  @Delete(':id')
  @ApiBasicAuth('api-key')
  @UseGuards(AuthGuard('headerapikey'))
  @ApiOperation({ summary: 'Delete a media' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Media deleted',
  })
  @ApiNotFoundResponse({
    description: 'Media not found',
  })
  public async delete(@GetPartner() partner: Partner, @Param() params: MediaIdDto): Promise<void> {
    await this.mediaService.deleteMedia(partner, params.id);
  }
}
