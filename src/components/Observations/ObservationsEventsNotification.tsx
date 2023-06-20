import { useMemo } from 'react';
import { Box } from '@mui/material';
import { Button, Message } from '@terraware/web-components';
import strings from 'src/strings';
import { SEED_COLLECTOR_APP_STORE_LINK, SEED_COLLECTOR_GOOGLE_PLAY_LINK } from 'src/constants';
import { useLocalization } from 'src/providers';
import { getLongDate } from 'src/utils/dateFormatter';

export type ObservationEvent = {
  startDate: string;
  plantingSiteName: string;
};

export type ObservationsEventsNotificationProps = {
  events: ObservationEvent[];
};

export default function ObservationsEventsNotification({ events }: ObservationsEventsNotificationProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const openTab = (url: string) => window.open(url, '_blank');

  const eventStrings = useMemo(() => {
    const dateEvents: Record<string, string[]> = {};

    events.forEach((event) => {
      const startDate = getLongDate(event.startDate, activeLocale);
      dateEvents[startDate] = [...(dateEvents[startDate] ?? []), event.plantingSiteName];
    });

    return Object.keys(dateEvents).map((key) => {
      const date = key;
      const sites = dateEvents[key];
      if (sites.length === 1) {
        return strings.formatString(strings.OBSERVATION_EVENT_SCHEDULED, date, sites[0]);
      } else {
        return strings.formatString(
          strings.OBSERVATION_EVENTS_SCHEDULED,
          date,
          sites.slice(0, sites.length - 1).join(', '),
          sites.slice(-1)[0]
        );
      }
    });
  }, [activeLocale, events]);

  return (
    <Box marginBottom={3} display='flex' flexGrow={1}>
      <Message
        type='page'
        priority='info'
        title={strings.OBSERVATIONS_WITH_THE_TERRAWARE_APP}
        body={
          <>
            {eventStrings.length > 0 && (
              <Box marginBottom={3}>
                {eventStrings.map((eventString, index) => (
                  <Box key={index}>{eventString}</Box>
                ))}
              </Box>
            )}
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
            onClick={() => openTab(SEED_COLLECTOR_APP_STORE_LINK)}
          />,
          <Button
            label={strings.DOWNLOAD_ON_GOOGLE_PLAY}
            size='small'
            key='2'
            priority='secondary'
            type='passive'
            onClick={() => openTab(SEED_COLLECTOR_GOOGLE_PLAY_LINK)}
          />,
        ]}
      />
    </Box>
  );
}
