import React from 'react';

type Props = {
  width?: number | string;
  height?: number | string;
  path?: string;
  alt: string;
};

const PhotoImgComponent: React.FC<Props> = ({ width, height, path, alt }) =>
  path && path.length ? (
    <img src={path} style={{ maxHeight: height || width, maxWidth: width }} alt={alt} />
  ) : (
    <span>There is no image</span>
  );

export default PhotoImgComponent;
