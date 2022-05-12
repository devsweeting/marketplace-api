import { Media } from 'modules/assets/entities';
import { MediaTypeEnum } from 'modules/assets/enums/media-type.enum';
import React from 'react';
import PhotoImgComponent from '../../../components/photo-img';

type Props = {
  media: Media;
};

const MediaComponent: React.FC<Props> = ({ media }) => {
  if (media.type === MediaTypeEnum.Image) {
    return <PhotoImgComponent path={media.file.path} alt={media.file.name} width="200px" />;
  } else if (media.type === MediaTypeEnum.Youtube) {
    return <span>There is no image</span>;
  } else {
    return <span>There is no media</span>;
  }
};
export default MediaComponent;
