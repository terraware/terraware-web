import React, { type JSX, useEffect, useMemo } from 'react';

import { Box, Typography } from '@mui/material';
import { Message } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { ObservationPayload, useLazyListObservationsQuery } from 'src/queries/generated/observations';
import { getLongDate } from 'src/utils/dateFormatter';

export default function ObservationsEventsNotification(): JSX.Element | undefined {
  const { activeLocale, strings } = useLocalization();
  const { selectedOrganization } = useOrganization();

  const [listObservations, listObservationsResponse] = useLazyListObservationsQuery();

  useEffect(() => {
    if (selectedOrganization) {
      void listObservations({ organizationId: selectedOrganization.id }, true);
    }
  }, [listObservations, selectedOrganization]);

  const upcomingObservations = useMemo(() => {
    const now = Date.now();
    return (
      listObservationsResponse.data?.observations?.filter((observation) => {
        const endTime = new Date(observation.endDate).getTime();
        return observation.state === 'Upcoming' && now <= endTime;
      }) ?? []
    );
  }, [listObservationsResponse.data?.observations]);

  const observationsInfo = useMemo<
    {
      infoPrefix: string;
      observationDetails: {
        observation: ObservationPayload;
        rescheduleUrl: string;
      }[];
    }[]
  >(() => {
    const observationsByDate: Record<string, ObservationPayload[]> = {};

    upcomingObservations.forEach((observation) => {
      observationsByDate[observation.startDate] = [...(observationsByDate[observation.startDate] ?? []), observation];
    });

    return Object.keys(observationsByDate)
      .sort()
      .map((key) => {
        const date = getLongDate(key, activeLocale);
        const observations = observationsByDate[key];

        return {
          infoPrefix: strings.formatString(strings.OBSERVATION_EVENT_SCHEDULED, date) as string,
          observationDetails: observations.map((observation) => ({
            observation,
            rescheduleUrl: APP_PATHS.RESCHEDULE_OBSERVATION.replace(':observationId', observation.id.toString()),
          })),
        };
      });
  }, [activeLocale, strings, upcomingObservations]);

  if (observationsInfo.length === 0) {
    return undefined;
  }

  return (
    <Box marginBottom={3} display='flex' flexDirection='column' width='100%'>
      <Message
        type='page'
        priority='info'
        body={
          <Box>
            {observationsInfo.map((event, index) => (
              <Box key={index} display='flex'>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                  {event.infoPrefix}&nbsp;
                  {event.observationDetails.map((data, observationsIdx) => (
                    <span key={observationsIdx}>
                      {data.observation.plantingSiteName}&nbsp; (
                      <Link fontSize={16} to={data.rescheduleUrl}>
                        {strings.RESCHEDULE}
                      </Link>
                      ){observationsIdx < event.observationDetails.length - 1 ? ',' : ''}&nbsp;
                    </span>
                  ))}
                </Typography>
              </Box>
            ))}
          </Box>
        }
      />
    </Box>
  );
}
