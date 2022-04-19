import { Media } from 'modules/assets/entities';
import { MediaTypeEnum } from 'modules/assets/enums/media-type.enum';

export const createVideoMedia = (data: Partial<Media>): Promise<Media> => {
  const media = new Media({
    title: 'Example',
    description: 'test description',
    url: 'https://www.youtube.com/watch?v=4ZVdjRNBrnw',
    type: MediaTypeEnum.Youtube,
    sortOrder: 1,
    ...data,
  });

  return media.save();
};

export const createImageMedia = (data: Partial<Media>): Promise<Media> => {
  const media = new Media({
    title: 'Example',
    description: 'test description',
    url: 'https://example.com/image.png',
    type: MediaTypeEnum.Image,
    sortOrder: 1,
    ...data,
  });

  return media.save();
};
