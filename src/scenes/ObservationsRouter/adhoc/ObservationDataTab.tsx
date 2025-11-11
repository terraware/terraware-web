import React from 'react';

import { Box, Typography } from '@mui/material';
import { IconTooltip } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import isEnabled from 'src/features';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { getConditionString } from 'src/redux/features/observations/utils';
import strings from 'src/strings';
import { ObservationSpeciesResults, PlotCondition } from 'src/types/Observations';
import { getShortTime } from 'src/utils/dateFormatter';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import SpeciesTotalPlantsChart from '../common/SpeciesMortalityRateChart';
import SpeciesMortalityRateChart from '../common/SpeciesMortalityRateChart';
import SpeciesSurvivalRateChart from '../common/SpeciesSurvivalRateChart';
import ExtraData from './ExtraData';
import ObservationDataNumbers from './ObservationDataNumbers';

type ObservationDataTabProps = {
  isPermanent?: boolean;
  monitoringPlotSpecies?: ObservationSpeciesResults[];
  totalPlants?: number;
  livePlants?: number;
  deadPlants?: number;
  totalSpecies?: number;
  plantDensity?: number;
  survivalRate?: number;
  completedTime?: string;
  observer?: string;
  plotConditions?: PlotCondition[];
  fieldNotes?: string;
};

const ObservationDataTab = ({
  monitoringPlotSpecies,
  isPermanent,
  totalPlants,
  livePlants,
  deadPlants,
  totalSpecies,
  plantDensity,
  survivalRate,
  completedTime,
  observer,
  plotConditions,
  fieldNotes,
}: ObservationDataTabProps) => {
  const isSurvivalRateCalculationEnabled = isEnabled('Survival Rate Calculation');
  const { plantingSite } = usePlantingSiteData();
  const defaultTimeZone = useDefaultTimeZone();
  const { activeLocale } = useLocalization();

  const items = [
    {
      label: strings.TOTAL_PLANTS,
      tooltip: strings.PLOT_TOTAL_PLANTS_TOOLTIP,
      value: totalPlants,
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
      value: totalSpecies,
    },
    {
      label: strings.PLANT_DENSITY,
      tooltip: strings.PLOT_PLANT_DENSITY_TOOLTIP,
      value: plantDensity,
    },
    ...(survivalRate !== undefined
      ? [
          {
            label: strings.SURVIVAL_RATE,
            tooltip: strings.PLOT_SURVIVAL_RATE_TOOLTIP,
            value: `${survivalRate}%`,
          },
        ]
      : []),
  ];

  const extraItems = [
    {
      label: strings.PLOT_CONDITIONS,
      value: plotConditions?.map((condition) => getConditionString(condition)).join(', ') || '- -',
    },
    {
      label: strings.FIELD_NOTES,
      value: fieldNotes || '- -',
    },
  ];
  return (
    <Card radius='24px'>
      <ObservationDataNumbers items={items} />
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
      <Box paddingY={2}>
        {observer && completedTime && (
          <Typography fontSize={'14px'}>
            {strings.formatString(
              strings.OBSERVED_BY_ON,
              observer,
              getDateDisplayValue(completedTime, plantingSite?.timeZone),
              getShortTime(completedTime, activeLocale, plantingSite?.timeZone || defaultTimeZone.get().id)
            )}
          </Typography>
        )}
      </Box>
      <ExtraData items={extraItems} />
    </Card>
  );
};

export default ObservationDataTab;
