import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import { Typography, useTheme } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';

import AggregatedPlantsStats from '../AggregatedPlantsStats';
import useObservationSpecies from '../useObservationSpecies';
import StratumList from './StratumList';

const SiteDetails = (): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);

  const crumbs: Crumb[] = useMemo(() => {
    const crumbsData: Crumb[] = [
      {
        name: strings.OBSERVATIONS,
        to: APP_PATHS.OBSERVATIONS,
      },
    ];

    return crumbsData;
  }, [strings.OBSERVATIONS]);

  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });

  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);

  const title = (
    <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
      {`Observation ${results?.observationId}`}
    </Typography>
  );

  const species = useObservationSpecies(results?.species ?? []);

  return (
    <Page crumbs={crumbs} title={title} titleContainerStyle={{ paddingTop: 3, paddingBottom: 1 }}>
      <AggregatedPlantsStats
        completedTime={results?.completedTime}
        totalSpecies={results?.totalSpecies}
        plantingDensity={results?.plantingDensity}
        survivalRate={results?.survivalRate}
        species={species}
      />
      <StratumList />
    </Page>
  );
};

export default SiteDetails;
