import { flat } from 'adminjs';
import { Label, Box } from '@adminjs/design-system';

const HashedId = (props) => {
  const { record, property, where } = props;

  const params = flat.unflatten(record.params);

  return (
    <Box mb={where === 'list' ? 0 : 24}>
      {where !== 'list' && <Label variant={'light'}>{property.label}</Label>}
      {params.hashedId}
    </Box>
  );
};

export default HashedId;
