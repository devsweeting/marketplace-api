import { BasePropertyComponent } from 'adminjs';

const DeletedAtShow = (props) => {
  const { property, record } = props;

  const defaultProperty = { ...property, components: null };

  if (record.params.deletedAt) {
    return <BasePropertyComponent {...props} property={defaultProperty} />;
  }

  return null;
};

export default DeletedAtShow;
