import React, { useMemo } from 'react';

import { Box, Typography } from '@mui/material';
import { Button, Message } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { TERRAWARE_MOBILE_APP_ANDROID_GOOGLE_PLAY_LINK, TERRAWARE_MOBILE_APP_IOS_APP_STORE_LINK } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { getLongDate } from 'src/utils/dateFormatter';

export type ObservationEvent = {
  id: number;
  startDate: string;
  plantingSiteName: string;
  plantingSiteId: number;
};

export type ObservationsEventsNotificationProps = {
  events: ObservationEvent[];
};

export default function ObservationsEventsNotification({ events }: ObservationsEventsNotificationProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const openTab = (url: string) => window.open(url, '_blank');

  const eventsInfo = useMemo<
    {
      infoPrefix: string;
      eventDetails: {
        detail: ObservationEvent;
        rescheduleUrl: string;
      }[];
    }[]
  >(() => {
    const dateEvents: Record<string, ObservationEvent[]> = {};

    events.forEach((event) => {
      dateEvents[event.startDate] = [...(dateEvents[event.startDate] ?? []), event];
    });

    return Object.keys(dateEvents)
      .sort()
      .map((key) => {
        const date = getLongDate(key, activeLocale);
        const details = dateEvents[key];

        return {
          infoPrefix: strings.formatString(strings.OBSERVATION_EVENT_SCHEDULED, date) as string,
          eventDetails: details.map((detail) => ({
            detail,
            rescheduleUrl: APP_PATHS.RESCHEDULE_OBSERVATION.replace(':observationId', detail.id.toString()),
          })),
        };
      });
  }, [activeLocale, events]);

  return (
    <Box marginBottom={3} display='flex' flexDirection='column' width='100%'>
      <Message
        type='page'
        priority='info'
        title={strings.OBSERVATIONS_WITH_THE_TERRAWARE_APP}
        body={
          <>
            {eventsInfo.length > 0 && (
              <Box marginBottom={3}>
                {eventsInfo.map((event, index) => (
                  <Box key={index} display='flex'>
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                      {event.infoPrefix}&nbsp;
                      {event.eventDetails.map((data, eventDetailsIndex) => (
                        <span key={eventDetailsIndex}>
                          {data.detail.plantingSiteName}&nbsp; (
                          <Link fontSize={16} to={data.rescheduleUrl}>
                            {strings.RESCHEDULE}
                          </Link>
                          ){eventDetailsIndex < event.eventDetails.length - 1 ? ',' : ''}&nbsp;
                        </span>
                      ))}
                    </Typography>
                  </Box>
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
            onClick={() => openTab(TERRAWARE_MOBILE_APP_IOS_APP_STORE_LINK)}
          />,
          <Button
            label={strings.DOWNLOAD_ON_GOOGLE_PLAY}
            size='small'
            key='2'
            priority='secondary'
            type='passive'
            onClick={() => openTab(TERRAWARE_MOBILE_APP_ANDROID_GOOGLE_PLAY_LINK)}
          />,
        ]}
      />
    </Box>
  );
}
