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
  strata?: PlantingSite['strata'];
  requestedSubstratumIds?: Observation['requestedSubstratumIds'];
  statusSummary?: ObservationStatusSummary;
};

const ObservationStatusSummaryMessage = ({
  strata,
  requestedSubstratumIds,
  statusSummary,
}: ObservationStatusSummaryMessageProps): JSX.Element | null => {
  const theme = useTheme();

  const substratumMessageBody = useMemo(() => {
    if (!requestedSubstratumIds || requestedSubstratumIds.length === 0 || !strata || strata.length === 0) {
      return undefined;
    }

    const stratumListItems: JSX.Element[] = strata
      .map((stratum, index): JSX.Element | null => {
        const substratumNames = stratum.substrata
          .filter((substratum) => requestedSubstratumIds.includes(substratum.id))
          .map((substratum) => substratum.name);

        if (substratumNames.length === 0) {
          return null;
        }

        return <li key={index}>{`${stratum.name}: ${substratumNames.join(', ')}`}</li>;
      })
      .filter((element: JSX.Element | null): element is JSX.Element => element !== null);

    if (stratumListItems.length === 0) {
      return null;
    }

    return (
      <Box marginTop={3}>
        {strings.THIS_OBSERVATION_INCLUDES}
        <ul style={{ margin: 0, padding: `0 ${theme.spacing(3)}` }}>{stratumListItems}</ul>
      </Box>
    );
  }, [strata, requestedSubstratumIds, theme]);

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

            {substratumMessageBody}
          </>
        }
      />
    </Box>
  );
};

export default ObservationStatusSummaryMessage;
