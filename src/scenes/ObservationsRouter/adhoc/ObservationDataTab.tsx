import React from 'react';

import { Box, Typography } from '@mui/material';
import { IconTooltip } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import isEnabled from 'src/features';
import strings from 'src/strings';
import { ObservationSpeciesResults } from 'src/types/Observations';

import SpeciesTotalPlantsChart from '../common/SpeciesMortalityRateChart';
import SpeciesMortalityRateChart from '../common/SpeciesMortalityRateChart';
import SpeciesSurvivalRateChart from '../common/SpeciesSurvivalRateChart';

type ObservationDataTabProps = {
  isPermanent?: boolean;
  monitoringPlotSpecies?: ObservationSpeciesResults[];
};

const ObservationDataTab = ({ monitoringPlotSpecies, isPermanent }: ObservationDataTabProps) => {
  const isSurvivalRateCalculationEnabled = isEnabled('Survival Rate Calculation');
  return (
    <Card radius='24px'>
      {monitoringPlotSpecies && (
        <Box>
          <Box display='flex' alignContent={'center'}>
            <Typography fontSize={'20px'} fontWeight={600}>
              {strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES}
            </Typography>
            <IconTooltip title={strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES_TOOLTIP} />
          </Box>

          <Box height='360px'>
            <SpeciesTotalPlantsChart minHeight='360px' species={monitoringPlotSpecies} />
          </Box>
        </Box>
      )}

      {isPermanent &&
        (isSurvivalRateCalculationEnabled ? (
          <Box>
            <Typography fontSize={'20px'} fontWeight={600}>
              {strings.SURVIVAL_RATE_PER_SPECIES}
            </Typography>
            <Box height='360px'>
              <SpeciesSurvivalRateChart minHeight='360px' species={monitoringPlotSpecies} />
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography fontSize={'20px'} fontWeight={600}>
              {strings.MORTALITY_RATE_PER_SPECIES}
            </Typography>

            <Box height='360px'>
              <SpeciesMortalityRateChart minHeight='360px' species={monitoringPlotSpecies} />
            </Box>
          </Box>
        ))}
    </Card>
  );
};

export default ObservationDataTab;
