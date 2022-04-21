import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
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
import { AssetIdDto } from '../dto/media/asset-id.dto';
import { MediaIdDto } from '../dto/media/media-id.dto';
import { MediaDto } from '../dto/media/media.dto';
import { UpdateMediaDto } from '../dto/media/update-media.dto';
import { MediaResponse } from '../interfaces/response/media/media.response';

import { MediaService } from '../services/media.service';
import { MediaTransformer } from '../transformers/media.transformer';

@ApiTags('media')
@Controller('')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly mediaTransformer: MediaTransformer,
  ) {}

  @Post('assets/:assetId/media')
  @ApiBasicAuth('api-key')
  @UseGuards(AuthGuard('headerapikey'))
  @ApiOperation({ summary: 'Create a media' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Media created',
  })
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @GetPartner() partner: Partner,
    @Param() params: AssetIdDto,
    @Body() dto: MediaDto,
  ): Promise<MediaResponse> {
    const media = await this.mediaService.createMedia(partner, params.assetId, dto);

    return this.mediaTransformer.transform(media);
  }

  @Patch('media/:id')
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

  @Delete('media/:id')
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
