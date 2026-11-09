import React, { type JSX, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router';

import { Typography, useTheme } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import MonitoringPlotList from 'src/scenes/ObservationsRouterV2/SingleView/PlantMonitoring/Stratum/MonitoringPlotList';
import { getShortDate } from 'src/utils/dateFormatter';

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

  return (
    <Page crumbs={crumbs} title={title} hierarchicalCrumbs={false}>
      <Card radius='24px' style={{ width: '100%' }}>
        <MonitoringPlotList isBiomass />
      </Card>
    </Page>
  );
};

export default BiomassStratumDetails;
