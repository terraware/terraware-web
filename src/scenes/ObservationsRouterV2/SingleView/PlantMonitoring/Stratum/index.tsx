import React, { type JSX, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { IconTooltip } from '@terraware/web-components';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import SurvivalRateMessageV2 from 'src/components/SurvivalRate/SurvivalRateMessageV2';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useGetOneObservationResults } from 'src/hooks/observations';
import useSurvivalRateCalculationInProgress from 'src/hooks/useSurvivalRateCalculationInProgress';
import { useLocalization } from 'src/providers';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { getShortDate } from 'src/utils/dateFormatter';
import { getObservationSpeciesDeadPlantsCount, getObservationSpeciesLivePlantsCount } from 'src/utils/observation';

import ObservationDataNumbers from '../../BiomassMeasurements/ObservationDataNumbers';
import SpeciesSurvivalRateChart from '../SpeciesSurvivalRateChart';
import SpeciesTotalPlantsChart from '../SpeciesTotalPlantsChart';
import useObservationSpecies from '../useObservationSpecies';
import MonitoringPlotList from './MonitoringPlotList';

const StratumDetails = (): JSX.Element => {
  const theme = useTheme();
  const { activeLocale, strings } = useLocalization();
  const params = useParams<{ observationId: string; stratumName: string }>();
  const observationId = Number(params.observationId);
  const stratumName = params.stratumName;

  const { data: observationResultsResponse } = useGetOneObservationResults({ observationId });
  const [getPlantingSite, getPlantingSiteResult] = useLazyGetPlantingSiteQuery();
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const stratumResult = useMemo(
    () => results?.strata.find((stratum) => stratum.name === stratumName),
    [results?.strata, stratumName]
  );
  const plantingSite = useMemo(() => getPlantingSiteResult.data?.site, [getPlantingSiteResult.data?.site]);

  // Poll for survival rate recalculation and refresh observation results when it completes.
  useSurvivalRateCalculationInProgress(results?.plantingSiteId);

  useEffect(() => {
    if (results) {
      void getPlantingSite({ id: results.plantingSiteId, includeZones: false }, true);
    }
  }, [getPlantingSite, results]);

  const crumbs: Crumb[] = useMemo(() => {
    const crumbsData: Crumb[] = [
      {
        name: strings.OBSERVATIONS,
        to: APP_PATHS.OBSERVATIONS,
      },
    ];

    if (results && plantingSite) {
      const completedDate = results.completedTime
        ? getDateDisplayValue(results.completedTime, plantingSite.timeZone)
        : undefined;
      const observationDate = getShortDate(completedDate ?? results.startDate, activeLocale);
      crumbsData.push({
        name: `${observationDate} (${plantingSite.name})`,
        to: `/${observationId}`,
      });
    }

    return crumbsData;
  }, [activeLocale, observationId, plantingSite, results, strings.OBSERVATIONS]);

  const title = (
    <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
      {stratumResult?.name ?? ''}
    </Typography>
  );

  const species = useObservationSpecies(stratumResult?.species ?? []);
  const { isDesktop } = useDeviceInfo();
  const livePlants = useMemo(() => getObservationSpeciesLivePlantsCount(species), [species]);
  const deadPlants = useMemo(() => getObservationSpeciesDeadPlantsCount(species), [species]);

  const hasObservedPermanentPlots = useMemo(() => {
    const permanentPlots =
      stratumResult?.substrata.flatMap((substratum) => substratum.monitoringPlots).filter((plot) => plot.isPermanent) ??
      [];

    return permanentPlots.some((plot) => plot.status === 'Completed');
  }, [stratumResult?.substrata]);

  const items = [
    { label: strings.TOTAL_PLANTS, tooltip: strings.TOOLTIP_TOTAL_PLANTS, value: stratumResult?.totalPlants },
    { label: strings.LIVE_PLANTS, tooltip: strings.TOOLTIP_LIVE_PLANTS, value: livePlants },
    { label: strings.DEAD_PLANTS, tooltip: strings.PLOT_DEAD_PLANTS_TOOLTIP, value: deadPlants },
    { label: strings.SPECIES, tooltip: strings.PLOT_SPECIES_TOOLTIP, value: stratumResult?.totalSpecies },
    {
      label: strings.PLANT_DENSITY,
      tooltip: strings.PLANT_DENSITY_MISSING_TOOLTIP,
      value: stratumResult?.observedDensity,
    },
    {
      label: strings.SURVIVAL_RATE,
      tooltip: strings.SURVIVAL_RATE_COLUMN_TOOLTIP,
      value: hasObservedPermanentPlots ? `${stratumResult?.survivalRate ?? '-'}%` : '-',
    },
  ];

  return (
    <Page crumbs={crumbs} title={title}>
      <SurvivalRateMessageV2 selectedPlantingSiteId={results?.plantingSiteId} />
      <Card radius='24px' style={{ width: '100%' }}>
        <ObservationDataNumbers items={items} isCompleted={!!stratumResult?.completedTime} />
        <Box display='flex' gap={3} flexDirection={isDesktop ? 'row' : 'column'} flexWrap='wrap' marginBottom={3}>
          <Box flex={1} minWidth='500px'>
            <Box display='flex' alignItems='center'>
              <Typography fontSize='20px' fontWeight={600}>
                {strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES}
              </Typography>
              <IconTooltip title={strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES_TOOLTIP} />
            </Box>
            <Box height='245px'>
              <SpeciesTotalPlantsChart chartId='observationSpeciesTotalChart' minHeight='245px' species={species} />
            </Box>
          </Box>
          <Box flex={1} minWidth='500px'>
            <Box display='flex' alignItems='center'>
              <Typography fontSize='20px' fontWeight={600}>
                {strings.SURVIVAL_RATE_PER_SPECIES_AS_OF_THIS_OBSERVATION}
              </Typography>
              <IconTooltip title={strings.SURVIVAL_RATE_PER_SPECIES_AS_OF_THIS_OBSERVATION_TOOLTIP} />
            </Box>
            <Box height='245px'>
              <SpeciesSurvivalRateChart
                chartId='observationSurvivalRateChart'
                species={hasObservedPermanentPlots ? species : []}
                minHeight='245px'
              />
            </Box>
          </Box>
        </Box>
        <MonitoringPlotList />
      </Card>
    </Page>
  );
};

export default StratumDetails;
