import React, { type JSX, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { Typography, useTheme } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import StratumList from 'src/scenes/ObservationsRouterV2/SingleView/PlantMonitoring/Site/StratumList';
import { getShortDate } from 'src/utils/dateFormatter';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import useBiomassPlot from '../useBiomassPlot';

const BiomassSiteDetails = (): JSX.Element => {
  const theme = useTheme();
  const defaultTimezone = useDefaultTimeZone().get().id;
  const { activeLocale, strings } = useLocalization();
  const [searchParams] = useSearchParams();
  const plantingSiteIdParam = searchParams.get('plantingSiteId');

  const { results } = useBiomassPlot();
  const [getPlantingSite, getPlantingSiteResult] = useLazyGetPlantingSiteQuery();
  const plantingSite = useMemo(() => getPlantingSiteResult.data?.site, [getPlantingSiteResult.data?.site]);

  useEffect(() => {
    if (results?.plantingSiteId) {
      void getPlantingSite({ id: results.plantingSiteId, includeZones: false }, true);
    }
  }, [getPlantingSite, results?.plantingSiteId]);

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: strings.OBSERVATIONS,
        to: plantingSiteIdParam
          ? `${APP_PATHS.OBSERVATIONS}?plantingSiteId=${plantingSiteIdParam}`
          : APP_PATHS.OBSERVATIONS,
      },
    ],
    [plantingSiteIdParam, strings.OBSERVATIONS]
  );

  const title = useMemo(() => {
    if (!results) {
      return undefined;
    }
    const completedDate = results.completedTime
      ? getDateDisplayValue(results.completedTime, plantingSite?.timeZone ?? defaultTimezone)
      : undefined;
    const observationDate = getShortDate(completedDate ?? results.startDate, activeLocale);
    return (
      <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
        {observationDate} ({plantingSite?.name ?? ''})
      </Typography>
    );
  }, [activeLocale, defaultTimezone, plantingSite?.name, plantingSite?.timeZone, results, theme]);

  return (
    <Page crumbs={crumbs} title={title} titleContainerStyle={{ paddingTop: 3, paddingBottom: 1 }}>
      <Card radius='24px' style={{ width: '100%' }}>
        <StratumList isBiomass />
      </Card>
    </Page>
  );
};

export default BiomassSiteDetails;
