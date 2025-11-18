import React, { useMemo } from 'react';

import { Box, Typography } from '@mui/material';
import { IconTooltip } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import isEnabled from 'src/features';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { getConditionString } from 'src/redux/features/observations/utils';
import strings from 'src/strings';
import { ObservationMonitoringPlotResultsPayload, ObservationSpeciesResults } from 'src/types/Observations';
import { getShortTime } from 'src/utils/dateFormatter';
import { getObservationSpeciesDeadPlantsCount, getObservationSpeciesLivePlantsCount } from 'src/utils/observation';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import SpeciesTotalPlantsChart from '../common/SpeciesMortalityRateChart';
import SpeciesMortalityRateChart from '../common/SpeciesMortalityRateChart';
import SpeciesSurvivalRateChart from '../common/SpeciesSurvivalRateChart';
import ExtraData from './ExtraData';
import ObservationDataNumbers from './ObservationDataNumbers';

type ObservationDataTabProps = {
  monitoringPlot: Partial<Omit<ObservationMonitoringPlotResultsPayload, 'species'>>;
  species?: ObservationSpeciesResults[];
};

const ObservationDataTab = ({ monitoringPlot, species }: ObservationDataTabProps) => {
  const isSurvivalRateCalculationEnabled = isEnabled('Survival Rate Calculation');
  const { plantingSite } = usePlantingSiteData();
  const defaultTimeZone = useDefaultTimeZone();
  const { activeLocale } = useLocalization();

  const livePlants = useMemo(() => getObservationSpeciesLivePlantsCount(species), [species]);
  const deadPlants = useMemo(() => getObservationSpeciesDeadPlantsCount(species), [species]);

  const items = [
    {
      label: strings.TOTAL_PLANTS,
      tooltip: strings.PLOT_TOTAL_PLANTS_TOOLTIP,
      value: monitoringPlot?.totalPlants,
    },
    {
      label: strings.LIVE_PLANTS,
      tooltip: strings.PLOT_LIVE_PLANTS_TOOLTIP,
      value: livePlants,
    },
    {
      label: strings.DEAD_PLANTS,
      tooltip: strings.PLOT_DEAD_PLANTS_TOOLTIP,
      value: deadPlants,
    },
    {
      label: strings.SPECIES,
      tooltip: strings.PLOT_SPECIES_TOOLTIP,
      value: monitoringPlot?.totalSpecies,
    },
    {
      label: strings.PLANT_DENSITY,
      tooltip: strings.PLOT_PLANT_DENSITY_TOOLTIP,
      value: monitoringPlot?.plantingDensity,
    },
    ...(monitoringPlot?.survivalRate !== undefined
      ? [
          {
            label: strings.SURVIVAL_RATE,
            tooltip: strings.PLOT_SURVIVAL_RATE_TOOLTIP,
            value: `${monitoringPlot?.survivalRate}%`,
          },
        ]
      : []),
  ];

  const extraItems = [
    {
      label: strings.PLOT_CONDITIONS,
      value: monitoringPlot?.conditions?.map((condition) => getConditionString(condition)).join(', ') || '- -',
    },
    {
      label: strings.FIELD_NOTES,
      value: monitoringPlot?.notes || '- -',
    },
  ];
  return (
    <Card radius='24px'>
      <ObservationDataNumbers items={items} />
      {species && (
        <Box>
          <Box display='flex' alignContent={'center'}>
            <Typography fontSize={'20px'} fontWeight={600}>
              {strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES}
            </Typography>
            <IconTooltip title={strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES_TOOLTIP} />
          </Box>

          <Box height='360px'>
            <SpeciesTotalPlantsChart minHeight='360px' species={species} />
          </Box>
        </Box>
      )}

      {monitoringPlot?.isPermanent &&
        (isSurvivalRateCalculationEnabled ? (
          <Box>
            <Typography fontSize={'20px'} fontWeight={600}>
              {strings.SURVIVAL_RATE_PER_SPECIES}
            </Typography>
            <Box height='360px'>
              <SpeciesSurvivalRateChart minHeight='360px' species={species} />
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography fontSize={'20px'} fontWeight={600}>
              {strings.MORTALITY_RATE_PER_SPECIES}
            </Typography>

            <Box height='360px'>
              <SpeciesMortalityRateChart minHeight='360px' species={species} />
            </Box>
          </Box>
        ))}
      <Box paddingY={2}>
        {monitoringPlot?.claimedByName && monitoringPlot?.completedTime && (
          <Typography fontSize={'14px'}>
            {strings.formatString(
              strings.OBSERVED_BY_ON,
              monitoringPlot.claimedByName,
              getDateDisplayValue(monitoringPlot.completedTime, plantingSite?.timeZone),
              getShortTime(
                monitoringPlot.completedTime,
                activeLocale,
                plantingSite?.timeZone || defaultTimeZone.get().id
              )
            )}
          </Typography>
        )}
      </Box>
      <ExtraData items={extraItems} />
    </Card>
  );
};

export default ObservationDataTab;
