import React, { type JSX, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import MonitoringPlotList from 'src/scenes/ObservationsRouterV2/SingleView/PlantMonitoring/Stratum/MonitoringPlotList';
import { getShortDate } from 'src/utils/dateFormatter';
import { getBiomassStratumTotals } from 'src/utils/observation';

import LiveTreesPerSpecies from '../LiveTreesPerSpecies';
import ObservationDataNumbers from '../ObservationDataNumbers';
import useBiomassPlot from '../useBiomassPlot';

const BiomassStratumDetails = (): JSX.Element => {
  const theme = useTheme();
  const { activeLocale, strings } = useLocalization();
  const params = useParams<{ stratumName: string }>();
  const stratumName = params.stratumName;
  const [searchParams] = useSearchParams();
  const plantingSiteIdParam = searchParams.get('plantingSiteId');

  const { observationId, results } = useBiomassPlot();
  const [getPlantingSite, getPlantingSiteResult] = useLazyGetPlantingSiteQuery();
  const plantingSite = useMemo(() => getPlantingSiteResult.data?.site, [getPlantingSiteResult.data?.site]);

  const stratumResult = useMemo(
    () => results?.strata.find((stratum) => stratum.name === stratumName),
    [results?.strata, stratumName]
  );
  const totals = useMemo(() => (stratumResult ? getBiomassStratumTotals(stratumResult) : undefined), [stratumResult]);

  useEffect(() => {
    if (results?.plantingSiteId) {
      void getPlantingSite({ id: results.plantingSiteId, includeZones: false }, true);
    }
  }, [getPlantingSite, results?.plantingSiteId]);

  const crumbs: Crumb[] = useMemo(() => {
    const crumbsData: Crumb[] = [
      {
        name: strings.OBSERVATIONS,
        to: plantingSiteIdParam
          ? `${APP_PATHS.OBSERVATIONS}?plantingSiteId=${plantingSiteIdParam}`
          : APP_PATHS.OBSERVATIONS,
      },
    ];

    if (results && plantingSite) {
      const completedDate = results.completedTime
        ? getDateDisplayValue(results.completedTime, plantingSite.timeZone)
        : undefined;
      const observationDate = getShortDate(completedDate ?? results.startDate, activeLocale);
      crumbsData.push({
        name: `${observationDate} (${plantingSite.name})`,
        to: APP_PATHS.OBSERVATION_DETAILS_V2.replace(':observationId', `${observationId}`),
      });
    }

    return crumbsData;
  }, [activeLocale, observationId, plantingSite, plantingSiteIdParam, results, strings.OBSERVATIONS]);

  const title = (
    <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
      {stratumResult?.name ?? ''}
    </Typography>
  );

  const items = [
    { label: strings.TOTAL_PLANTS, tooltip: strings.BIOMASS_PLOT_TOTAL_PLANTS_TOOLTIP, value: totals?.totalPlants },
    { label: strings.LIVE_PLANTS, tooltip: strings.BIOMASS_PLOT_LIVE_PLANTS_TOOLTIP, value: totals?.totalLive },
    { label: strings.DEAD_PLANTS, tooltip: strings.BIOMASS_PLOT_DEAD_PLANTS_TOOLTIP, value: totals?.totalDead },
    { label: strings.SPECIES, tooltip: strings.BIOMASS_PLOT_SPECIES_TOOLTIP, value: totals?.totalSpecies },
  ];

  return (
    <Page crumbs={crumbs} title={title} hierarchicalCrumbs={false}>
      <Card radius='24px' style={{ width: '100%' }}>
        <ObservationDataNumbers items={items} isCompleted={!!stratumResult?.completedTime} />
        <Box display='flex' alignItems='center' paddingBottom={2}>
          <Typography
            fontSize='20px'
            lineHeight='28px'
            fontWeight={600}
            color={theme.palette.TwClrTxt}
            paddingRight={1}
          >
            {strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES}
          </Typography>
          <Tooltip title={strings.BIOMASS_NUMBER_OF_LIVE_PLANTS_PER_SPECIES_TOOLTIP}>
            <Icon name='info' fillColor={theme.palette.TwClrIcnSecondary} />
          </Tooltip>
        </Box>
        <Box height='300px'>
          <LiveTreesPerSpecies treeSpecies={totals?.treeSpecies} />
        </Box>
        <MonitoringPlotList isBiomass />
      </Card>
    </Page>
  );
};

export default BiomassStratumDetails;
