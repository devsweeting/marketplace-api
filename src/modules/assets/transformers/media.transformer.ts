import { Media } from '../entities';
import { Injectable } from '@nestjs/common';
import { MediaResponse } from '../interfaces/response/media/media.response';

@Injectable()
export class MediaTransformer {
  public transform(media: Media): MediaResponse {
    return {
      title: media.title,
      description: media.description,
      url: media.url,
      sortOrder: media.sortOrder,
      assetId: media.assetId,
      fileId: media.fileId,
    };
  }

  public transformAll(media: Media[]): MediaResponse[] {
    return media.map((media) => this.transform(media));
  }
}
