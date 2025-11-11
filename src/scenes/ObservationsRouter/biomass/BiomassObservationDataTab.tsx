import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { getConditionString } from 'src/redux/features/observations/utils';
import strings from 'src/strings';
import { BiomassMeasurement, ExistingTreePayload, PlotCondition } from 'src/types/Observations';
import { getDateTimeDisplayValue, getShortTime } from 'src/utils/dateFormatter';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import ExtraData from '../adhoc/ExtraData';
import ObservationDataNumbers from '../adhoc/ObservationDataNumbers';
import LiveTreesPerSpecies from './LiveTreesPerSpecies';

type BiomassObservationDataTabProps = {
  trees?: ExistingTreePayload[];
  totalPlants?: number;
  livePlants?: number;
  deadPlants?: number;
  totalSpecies?: number;
  completedTime?: string;
  observer?: string;
  plotConditions?: PlotCondition[];
  fieldNotes?: string;
  biomassMeasurement?: BiomassMeasurement;
  plotLocation?: string;
};

const BiomassObservationDataTab = ({
  trees,
  biomassMeasurement,
  totalPlants,
  livePlants,
  deadPlants,
  totalSpecies,
  completedTime,
  observer,
  plotConditions,
  fieldNotes,
  plotLocation,
}: BiomassObservationDataTabProps) => {
  const theme = useTheme();
  const { plantingSite } = usePlantingSiteData();
  const defaultTimeZone = useDefaultTimeZone();
  const { activeLocale } = useLocalization();

  const items = [
    {
      label: strings.TOTAL_PLANTS,
      tooltip: strings.BIOMASS_PLOT_TOTAL_PLANTS_TOOLTIP,
      value: totalPlants,
    },
    {
      label: strings.LIVE_PLANTS,
      tooltip: strings.BIOMASS_PLOT_LIVE_PLANTS_TOOLTIP,
      value: livePlants,
    },
    {
      label: strings.DEAD_PLANTS,
      tooltip: strings.BIOMASS_PLOT_DEAD_PLANTS_TOOLTIP,
      value: deadPlants,
    },
    {
      label: strings.SPECIES,
      tooltip: strings.BIOMASS_PLOT_SPECIES_TOOLTIP,
      value: totalSpecies,
    },
    {
      label: strings.PLOT_LOCATION,
      tooltip: strings.BIOMASS_PLOT_LOCATION_TOOLTIP,
      value: plotLocation,
    },
  ];

  const extraItems = [
    {
      label: strings.PLOT_DESCRIPTION,
      value: biomassMeasurement?.description,
    },
    {
      label: strings.TYPE_OF_FOREST,
      value: biomassMeasurement?.forestType,
    },
    {
      label: strings.NUMBER_OF_SMALL_TREES,
      value:
        biomassMeasurement?.smallTreeCountLow || biomassMeasurement?.smallTreeCountHigh
          ? `${biomassMeasurement?.smallTreeCountLow}-${biomassMeasurement?.smallTreeCountHigh}`
          : '0',
    },
    {
      label: strings.HERBACIOUS_COVER_PERCENT,
      value: 0,
    },
    {
      label: strings.WATER_DEPTH_M,
      value: biomassMeasurement?.waterDepth,
    },
    {
      label: strings.SALINITY_PPT,
      value: biomassMeasurement?.salinity,
    },
    {
      label: strings.PH,
      value: biomassMeasurement?.ph,
    },
    {
      label: strings.TIDE,
      value: biomassMeasurement?.tide,
    },
    {
      label: strings.MEASUREMENT_TIME,
      value: biomassMeasurement?.tideTime
        ? getDateTimeDisplayValue(new Date(biomassMeasurement?.tideTime).getTime())
        : '- -',
    },
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
      <Typography
        fontSize='20px'
        lineHeight='28px'
        fontWeight={600}
        color={theme.palette.TwClrTxt}
        paddingBottom={2}
        paddingTop={3}
      >
        {strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES}
      </Typography>
      <Box height='360px'>
        <LiveTreesPerSpecies trees={trees} />
      </Box>
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

export default BiomassObservationDataTab;
