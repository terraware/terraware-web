import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Typography, useTheme } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';

import AggregatedPlantsStats from '../AggregatedPlantsStats';
import useObservationSpecies from '../useObservationSpecies';
import MonitoringPlotList from './MonitoringPlotList';

const StratumDetails = (): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
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

    if (plantingSite) {
      crumbsData.push({
        name: plantingSite.name,
        to: `/${observationId}`,
      });
    }

    return crumbsData;
  }, [observationId, plantingSite, strings.OBSERVATIONS]);

  const title = (
    <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
      {`Observation ${results?.observationId}`}
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
      <MonitoringPlotList />
    </Page>
  );
};

export default StratumDetails;
