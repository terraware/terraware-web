import React, { type JSX, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Typography, useTheme } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import ObservationMapWrapper from 'src/scenes/ObservationsRouterV2/Map';
import { getShortDate } from 'src/utils/dateFormatter';

import AggregatedPlantsStats from '../AggregatedPlantsStats';
import useObservationSpecies from '../useObservationSpecies';
import MonitoringPlotList from './MonitoringPlotList';

const StratumDetails = (): JSX.Element => {
  const theme = useTheme();
  const { activeLocale, strings } = useLocalization();
  const params = useParams<{ observationId: string; stratumName: string }>();
  const observationId = Number(params.observationId);
  const stratumName = params.stratumName;

  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });
  const [getPlantingSite, getPlantingSiteResult] = useLazyGetPlantingSiteQuery();
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const stratumResult = useMemo(
    () => results?.strata.find((stratum) => stratum.name === stratumName),
    [results?.strata, stratumName]
  );
  const plantingSite = useMemo(() => getPlantingSiteResult.data?.site, [getPlantingSiteResult.data?.site]);

  useEffect(() => {
    if (results) {
      void getPlantingSite(results.plantingSiteId);
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

  return (
    <Page crumbs={crumbs} title={title} titleContainerStyle={{ paddingTop: 3, paddingBottom: 1 }}>
      <AggregatedPlantsStats
        completedTime={stratumResult?.completedTime}
        totalSpecies={stratumResult?.totalSpecies}
        plantingDensity={stratumResult?.plantingDensity}
        survivalRate={stratumResult?.survivalRate}
        species={species}
      />
      <Card radius={'8px'} style={{ marginBottom: theme.spacing(3), width: '100%' }}>
        <ObservationMapWrapper observationId={observationId} plantingSiteId={results?.plantingSiteId} />
      </Card>
      <MonitoringPlotList />
    </Page>
  );
};

export default StratumDetails;
