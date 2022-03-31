import { Box, DrawerContent, Header } from '@adminjs/design-system';
import { BasePropertyComponent } from 'adminjs';

import EventComponent from '../resources/asset/components/events-table.component';

const ShowWithEvents = (props) => {
  const { resource, record } = props;
  const properties = resource.showProperties;

  return (
    <Box>
      <Box variant="grey">
        <DrawerContent>
          {properties.map((property) => (
            <BasePropertyComponent
              key={property.propertyPath}
              where="show"
              property={property}
              resource={resource}
              record={record}
            />
          ))}
        </DrawerContent>
      </Box>
      <Box variant="grey">
        <Header>Asset History</Header>
        <DrawerContent>
          <EventComponent {...props} />
        </DrawerContent>
      </Box>
    </Box>
  );
};

export default ShowWithEvents;
