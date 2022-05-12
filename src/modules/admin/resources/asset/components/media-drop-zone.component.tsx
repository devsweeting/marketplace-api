import { memo } from 'react';
import { DropZone } from '@adminjs/design-system';

const MediaDropZone = ({ validation, files, onUpdateImage }) => {
  return <DropZone validate={validation} files={files} onChange={onUpdateImage} />;
};

export default memo(MediaDropZone);
