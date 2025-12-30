import React from 'react';
import { useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import strings from 'src/strings';
import { Observation } from 'src/types/Observations';
import { PlantingSite } from 'src/types/Tracking';

export type ObservationStatusSummary = {
  endDate: string;
  pendingPlots: number;
  totalPlots: number;
  observedPlots: number;
  observedPlotsPercentage: number;
};

type ObservationStatusSummaryMessageProps = {
  plantingZones?: PlantingSite['strata'];
  requestedSubzoneIds?: Observation['requestedSubstratumIds'];
  statusSummary?: ObservationStatusSummary;
};

const ObservationStatusSummaryMessage = ({
  plantingZones,
  requestedSubzoneIds,
  statusSummary,
}: ObservationStatusSummaryMessageProps): JSX.Element | null => {
  const theme = useTheme();

  const subzoneMessageBody = useMemo(() => {
    if (!requestedSubzoneIds || requestedSubzoneIds.length === 0 || !plantingZones || plantingZones.length === 0) {
      return undefined;
    }

    const zoneListItems: JSX.Element[] = plantingZones
      .map((zone, index): JSX.Element | null => {
        const subzoneNames = zone.substrata
          .filter((subzone) => requestedSubzoneIds.includes(subzone.id))
          .map((subzone) => subzone.name);

        if (subzoneNames.length === 0) {
          return null;
        }

        return <li key={index}>{`${zone.name}: ${subzoneNames.join(', ')}`}</li>;
      })
      .filter((element: JSX.Element | null): element is JSX.Element => element !== null);

    if (zoneListItems.length === 0) {
      return null;
    }

    return (
      <Box marginTop={3}>
        {strings.THIS_OBSERVATION_INCLUDES}
        <ul style={{ margin: 0, padding: `0 ${theme.spacing(3)}` }}>{zoneListItems}</ul>
      </Box>
    );
  }, [plantingZones, requestedSubzoneIds, theme]);

  if (!statusSummary) {
    return null;
  }

  return (
    <Box marginBottom={3} display='flex' flexGrow={1}>
      <Message
        type='page'
        priority='info'
        title={strings.OBSERVATION_STATUS}
        body={
          <>
            <Box>
              {
                strings.formatString(
                  strings.OBSERVATIONS_REQUIRED_BY_DATE,
                  statusSummary.pendingPlots.toString(),
                  statusSummary.endDate
                ) as string
              }
            </Box>

            <Box>
              {
                strings.formatString(
                  strings.OBSERVATIONS_COMPLETION_PERCENTAGE,
                  statusSummary.observedPlots,
                  statusSummary.totalPlots,
                  statusSummary.observedPlotsPercentage
                ) as string
              }
            </Box>

            {subzoneMessageBody}
          </>
        }
      />
    </Box>
  );
};

export default ObservationStatusSummaryMessage;
