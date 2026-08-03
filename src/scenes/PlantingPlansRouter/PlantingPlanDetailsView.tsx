import React, { type JSX, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import SegmentControl, { SegmentOption } from 'src/components/common/SegmentControl';
import { APP_PATHS } from 'src/constants';
import useBoolean from 'src/hooks/useBoolean';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useLocalization } from 'src/providers';
import AddPlantingSeasonModal from 'src/scenes/NurseryRouter/PlantingSeasons/AddPlantingSeasonModal';

import PlantingPlanOverview from './PlantingPlanOverview';
import PlantingPlanSeasons from './PlantingPlanSeasons';
import PlantingPlanSiteGoals from './PlantingPlanSiteGoals';

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
  const [addSeasonModalOpen, , openAddSeasonModal, closeAddSeasonModal] = useBoolean(false);

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

  const description = useMemo(
    () => (segment === 'overview' ? strings.PLANTING_PLAN_DESCRIPTION : strings.SITE_GOALS_DESCRIPTION),
    [segment, strings]
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
            {description}
          </Typography>
        </Box>
      ) : undefined,
    [description, plantingSite, segment, segments, selectSegment, strings, theme]
  );

  if (isLoading || !plantingSite) {
    return <BusySpinner withSkrim={true} />;
  }

  const showAddSeasonButton = segment === 'plantingSeasons';

  const rightComponent = showAddSeasonButton ? (
    <Button
      id='addPlantingSeason'
      icon='plus'
      label={strings.ADD_PLANTING_SEASON}
      onClick={openAddSeasonModal}
      size='medium'
    />
  ) : undefined;

  return (
    <Page
      title={title}
      crumbs={crumbs}
      rightComponent={rightComponent}
      leftComponentGridSize={0}
      rightComponentGridSize={showAddSeasonButton ? 3 : 0}
    >
      {addSeasonModalOpen && (
        <AddPlantingSeasonModal
          onClose={closeAddSeasonModal}
          initialPlantingSiteId={plantingSite.id}
          hidePlantingSiteSelector
        />
      )}
      {segment === 'overview' && <PlantingPlanOverview plantingSite={plantingSite} />}
      {segment === 'siteGoals' && <PlantingPlanSiteGoals plantingSite={plantingSite} />}
      {segment === 'plantingSeasons' && <PlantingPlanSeasons plantingSite={plantingSite} />}
    </Page>
  );
};

export default PlantingPlanDetailsView;
