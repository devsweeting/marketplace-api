import { Media } from '../entities';
import { Injectable } from '@nestjs/common';
import { MediaResponse } from '../interfaces/response/media/media.response';
import { StorageService } from 'modules/storage/storage.service';

@Injectable()
export class MediaTransformer {
  public constructor(private readonly storageService: StorageService) {}

  public transform(media: Media): MediaResponse {
    return {
      title: media.title,
      description: media.description,
      url: media.url,
      sortOrder: media.sortOrder,
      assetId: media.assetId,
      fileId: media.fileId,
      file: media.file ? this.storageService.getUrl(media.file) : null,
    };
  }

  public transformAll(medias: Media[]): MediaResponse[] {
    return medias.map((media) => this.transform(media));
  }
}
