import format from 'date-fns/format';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Text,
} from '@adminjs/design-system';
import { flat, useTranslation } from 'adminjs';

const EventComponent = (props) => {
  const { record } = props;

  const params = flat.unflatten(record.params);
  const events = params['events'] || [];

  const { translateMessage: tm } = useTranslation();

  return (
    <Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{tm('eventsTable.event', 'Event')}</TableCell>
            <TableCell>{tm('eventsTable.unitPrice', 'Event')}</TableCell>
            <TableCell>{tm('eventsTable.quantity', 'Event')}</TableCell>
            <TableCell>{tm('eventsTable.from', 'Event')}</TableCell>
            <TableCell>{tm('eventsTable.to', 'Event')}</TableCell>
            <TableCell>{tm('eventsTable.date', 'Event')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((response, index) => {
            return (
              <TableRow key={index} title={format(new Date(response.createdAt), 'MMMM do h:mm a')}>
                <TableCell>
                  <Text>{response.eventType}</Text>
                </TableCell>
                <TableCell>
                  <Text>{response.totalPrice}</Text>
                </TableCell>
                <TableCell>
                  <Text>{response.quantity}</Text>
                </TableCell>
                <TableCell>
                  <Text>{response.fromAddress}</Text>
                </TableCell>
                <TableCell>
                  <Text>{response.toAddress}</Text>
                </TableCell>
                <TableCell>
                  <Text>{format(new Date(response.createdAt), 'MMMM do h:mm a')}</Text>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

export default EventComponent;
