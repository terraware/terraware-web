import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import { useListObservationResults } from 'src/hooks/observations';
import { useLocalization, useOrganization } from 'src/providers';

type SurvivalRateRecalculationMessageProps = {
  selectedPlantingSiteId: number | undefined;
};

const SurvivalRateRecalculationMessage = ({ selectedPlantingSiteId }: SurvivalRateRecalculationMessageProps) => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();

  const listObservationsResultsResponse = useListObservationResults({
    organizationId: selectedOrganization?.id,
    plantingSiteId: selectedPlantingSiteId,
    depth: 'Site',
  });

  const survivalRateCalculationInProgress = useMemo(
    () =>
      listObservationsResultsResponse.currentData?.observations.some(
        (result) => result.survivalRateCalculationInProgress
      ) ?? false,
    [listObservationsResultsResponse.currentData?.observations]
  );

  if (!survivalRateCalculationInProgress) {
    return undefined;
  }

  return (
    <Box marginBottom={theme.spacing(4)} width={'100%'}>
      <Message
        title={strings.SURVIVAL_RATE_RECALCULATION_TITLE}
        body={<Typography>{strings.SURVIVAL_RATE_RECALCULATION_MESSAGE}</Typography>}
        priority='info'
        type='page'
      />
    </Box>
  );
};

export default SurvivalRateRecalculationMessage;
