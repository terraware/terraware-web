import { Box } from '@mui/material';
import { Button, Message } from '@terraware/web-components';
import strings from 'src/strings';
import { getLongDate } from 'src/utils/dateFormatter';

type ObservationEvent = {
  startDate: string;
  plantingSiteName: string;
};

type ObservationsEventsNotificationProps = {
  events: ObservationEvent[];
};

export default function ObservationsEventsNotification({ events }: ObservationsEventsNotificationProps): JSX.Element {

  const openTab = (url: string) => window.open(url, '_blank');

  return (
    <Box marginBottom={3} display='flex' flexGrow={1}>
      <Message
        type='page'
        priority='info'
        title={strings.OBSERVATIONS_WITH_THE_TERRAWARE_APP}
        body={
          <>
            <Box marginBottom={3}>
              {
                strings.formatString(
                  strings.OBSERVATIONS_REQUIRED_BY_DATE,
                  statusSummary.pendingPlots.toString(),
                  statusSummary.endDate
                ) as string
              }
            </Box>
            <Box>{strings.OBSERVATIONS_DOWNLOAD_APP}</Box>
          </>
        }
        pageButtons={[
          <Button
            label={strings.DOWNLOAD_ON_APP_STORE}
            size='small'
            key='1'
            priority='secondary'
            type='passive'
            onClick={() => openTab('link')}
          />,
          <Button
            label={strings.DOWNLOAD_ON_GOOGLE_PLAY}
            size='small'
            key='2'
            priority='secondary'
            type='passive'
            onClick={() => openTab('link')}
          />,
        ]}
      />
    </Box>

  );
}
