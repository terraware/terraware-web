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
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import AggregatedPlantsStats from '../AggregatedPlantsStats';
import useObservationSpecies from '../useObservationSpecies';
import StratumList from './StratumList';

const SiteDetails = (): JSX.Element => {
  const theme = useTheme();
  const defaultTimezone = useDefaultTimeZone().get().id;
  const { activeLocale, strings } = useLocalization();
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
  const [getPlantingSite, getPlantingSiteResult] = useLazyGetPlantingSiteQuery();

  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const plantingSite = useMemo(() => getPlantingSiteResult.data?.site, [getPlantingSiteResult.data?.site]);

  useEffect(() => {
    if (results?.plantingSiteId) {
      void getPlantingSite(results.plantingSiteId);
    }
  }, [getPlantingSite, results?.plantingSiteId]);

  const title = useMemo(() => {
    if (results) {
      const completedDate = results.completedTime
        ? getDateDisplayValue(results.completedTime, plantingSite?.timeZone ?? defaultTimezone)
        : undefined;
      const observationDate = getShortDate(completedDate ?? results.startDate, activeLocale);
      return (
        <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
          {observationDate} ({plantingSite?.name ?? ''})
        </Typography>
      );
    } else {
      return undefined;
    }
  }, [activeLocale, defaultTimezone, plantingSite?.name, plantingSite?.timeZone, results, theme.palette.TwClrTxt]);

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
      <Card radius={'8px'} style={{ marginBottom: theme.spacing(3), width: '100%' }}>
        <ObservationMapWrapper observationId={observationId} plantingSiteId={results?.plantingSiteId} />
      </Card>
      <StratumList />
    </Page>
  );
};

export default SiteDetails;
