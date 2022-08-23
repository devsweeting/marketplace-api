import { Media } from '../entities';
import { Injectable } from '@nestjs/common';
import { MediaResponse } from '../responses/media/media.response';
import { StorageService } from 'modules/storage/storage.service';

@Injectable()
export class MediaTransformer {
  public constructor(private readonly storageService: StorageService) {}

  public transform(media: Media): MediaResponse {
    return {
      id: media.id,
      title: media.title,
      description: media.description,
      url: media.source_url,
      sortOrder: media.sortOrder,
      assetId: media.assetId,
      fileId: media.fileId,
      file: media.file ? this.storageService.getUrl(media.file) : null,
      absoluteUrl: media.file && media.file.absoluteUrl ? media.file.absoluteUrl : null,
    };
  }

  public transformAll(media: Media[]): MediaResponse[] {
    return media.map((media) => this.transform(media));
  }
}
