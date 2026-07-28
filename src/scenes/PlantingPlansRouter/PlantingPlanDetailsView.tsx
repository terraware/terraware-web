import React, { type JSX, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import SegmentControl, { SegmentOption } from 'src/components/common/SegmentControl';
import { APP_PATHS } from 'src/constants';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useLocalization } from 'src/providers';

import PlantingPlanOverview from './PlantingPlanOverview';

type PlantingPlanSegment = 'overview' | 'siteGoals' | 'plantingSeasons';

const SEGMENT_STORAGE_KEY = 'plantingPlanSegment';

const readStoredSegment = (): PlantingPlanSegment => {
  const stored = sessionStorage.getItem(SEGMENT_STORAGE_KEY);
  return stored === 'siteGoals' || stored === 'plantingSeasons' ? stored : 'overview';
};

const PlantingPlanDetailsView = (): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();

  const params = useParams<{ plantingSiteId: string }>();
  const plantingSiteId = Number(params.plantingSiteId);
  const { plantingSite, isLoading } = usePlantingSite(plantingSiteId);

  const [segment, setSegment] = useState<PlantingPlanSegment>(readStoredSegment);

  const selectSegment = useCallback((next: PlantingPlanSegment) => {
    setSegment(next);
    sessionStorage.setItem(SEGMENT_STORAGE_KEY, next);
  }, []);

  const crumbs = useMemo(
    (): Crumb[] => [{ name: strings.PLANTING_PLANS, to: APP_PATHS.PLANTING_PLANS }],
    [strings.PLANTING_PLANS]
  );

  const segments = useMemo(
    (): SegmentOption<PlantingPlanSegment>[] => [
      { id: 'overview', label: strings.OVERVIEW, icon: 'iconList' },
      { id: 'siteGoals', label: strings.SITE_GOALS, icon: 'iconMyLocation' },
      { id: 'plantingSeasons', label: strings.PLANTING_SEASONS, icon: 'iconCalendar' },
    ],
    [strings]
  );

  const title = useMemo(
    () =>
      plantingSite ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(1), width: '100%' }}>
          <Typography fontSize='14px' color={theme.palette.TwClrTxt} lineHeight='20px'>
            {strings.PLANTING_PLAN}
          </Typography>
          <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: theme.spacing(2) }}>
            <Typography fontSize='24px' fontWeight={600} color={theme.palette.TwClrTxt}>
              {plantingSite.name}
            </Typography>
            <SegmentControl segments={segments} selected={segment} onChange={selectSegment} />
          </Box>
          <Typography fontSize='14px' color={theme.palette.TwClrTxt} lineHeight='20px'>
            {strings.PLANTING_PLAN_DESCRIPTION}
          </Typography>
        </Box>
      ) : undefined,
    [plantingSite, segment, segments, selectSegment, strings, theme]
  );

  if (isLoading || !plantingSite) {
    return <BusySpinner withSkrim={true} />;
  }

  return (
    <Page title={title} crumbs={crumbs} leftComponentGridSize={0} rightComponentGridSize={0}>
      {segment === 'overview' && <PlantingPlanOverview plantingSite={plantingSite} />}
    </Page>
  );
};

export default PlantingPlanDetailsView;
