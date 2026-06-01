import React, { type JSX, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { Button, Icon, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageSnackbar from 'src/components/PageSnackbar';
import BackToLink from 'src/components/common/BackToLink';
import Card from 'src/components/common/Card';
import ProgressChart from 'src/components/common/Chart/ProgressChart';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useLazyGetPlantingSeasonQuery, useLazyGetSpeciesTargetsQuery } from 'src/queries/generated/plantingSeasons';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { getMediumDate } from 'src/utils/dateFormatter';
import useStickyTabs from 'src/utils/useStickyTabs';

import EditPlantingSeasonModal from './EditPlantingSeasonModal';
import PlantingSeasonStatusBadge from './PlantingSeasonStatusBadge';

const PlantingSeasonDetailsView = (): JSX.Element => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const { plantingSeasonId } = useParams<{ plantingSeasonId: string }>();
  const seasonIdNumber = Number(plantingSeasonId);

  const [getPlantingSeason, { data: plantingSeasonData }] = useLazyGetPlantingSeasonQuery();
  const [getPlantingSite, { data: plantingSiteData }] = useLazyGetPlantingSiteQuery();
  const [getSpeciesTargets, { data: speciesTargets }] = useLazyGetSpeciesTargetsQuery();

  useEffect(() => {
    if (plantingSeasonId) {
      void getPlantingSeason(seasonIdNumber);
      void getSpeciesTargets(seasonIdNumber);
    }
  }, [getPlantingSeason, getSpeciesTargets, plantingSeasonId, seasonIdNumber]);

  const season = plantingSeasonData?.season;

  useEffect(() => {
    if (season?.plantingSiteId) {
      void getPlantingSite({ id: season.plantingSiteId });
    }
  }, [getPlantingSite, season?.plantingSiteId]);

  const plantingSite = plantingSiteData?.site;

  const [editModalOpen, setEditModalOpen] = useState(false);

  const plantingGoal = useMemo(() => {
    const targets = speciesTargets?.targets;
    if (!targets || targets.length === 0) {
      return undefined;
    }
    return targets.reduce((sum, t) => sum + t.quantity, 0);
  }, [speciesTargets]);

  const dateRange = useMemo(() => {
    if (!season) {
      return '';
    }
    return `${getMediumDate(season.startDate, activeLocale)} - ${getMediumDate(season.endDate, activeLocale)}`;
  }, [season, activeLocale]);

  const strataNames = useMemo(() => (plantingSite?.strata ?? []).map((s) => s.name), [plantingSite]);
  const substrataNames = useMemo(
    () => (plantingSite?.strata ?? []).flatMap((s) => s.substrata.map((sub) => sub.fullName)),
    [plantingSite]
  );

  const numberColumn = (label: string, value: number | undefined) => (
    <Box textAlign='right' minWidth='120px'>
      <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
        {label}
      </Typography>
      <Typography fontSize='24px' fontWeight={600}>
        {value === undefined ? '-' : value.toLocaleString(activeLocale || undefined)}
      </Typography>
    </Box>
  );

  const tabs = useMemo(
    () => [
      {
        id: 'species-targets',
        label: strings.SPECIES_TARGETS,
        children: <Box />,
      },
      {
        id: 'planting-dates',
        label: strings.PLANTING_DATES,
        children: <Box />,
      },
    ],
    []
  );

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'species-targets',
    tabs,
    viewIdentifier: 'planting-season-details',
  });

  if (!season || !plantingSite) {
    return <TfMain />;
  }

  return (
    <TfMain>
      {editModalOpen && (
        <EditPlantingSeasonModal
          onClose={() => setEditModalOpen(false)}
          plantingSeason={season}
          plantingSite={plantingSite}
        />
      )}
      <PageHeaderWrapper>
        <BackToLink
          id='back'
          name={`${strings.PLANTING_SEASONS} / ${season.name} (${plantingSite.name})`}
          to={APP_PATHS.PLANTING_SEASONS}
        />
        <PageSnackbar />
      </PageHeaderWrapper>
      <Card style={{ width: '100%', marginTop: theme.spacing(3) }} radius={theme.spacing(1)}>
        <Box display='flex' flexDirection={isMobile ? 'column' : 'row'} gap={theme.spacing(2)}>
          <Box flex={1}>
            <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
              <Icon name='iconCalendar' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
              <Typography fontSize='20px' fontWeight={600}>
                {season.name}
              </Typography>
              <Button
                icon='iconEdit'
                onClick={() => setEditModalOpen(true)}
                priority='ghost'
                size='small'
                type='passive'
              />
              <PlantingSeasonStatusBadge status={season.status} />
            </Box>
            <Box display='flex' alignItems='center' gap={theme.spacing(2)} marginTop={theme.spacing(1)}>
              <Typography color={theme.palette.TwClrTxtSecondary}>{plantingSite.name}</Typography>
              <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
                <Typography color={theme.palette.TwClrTxt}>{dateRange}</Typography>
                <Button
                  icon='iconEdit'
                  onClick={() => setEditModalOpen(true)}
                  priority='ghost'
                  size='small'
                  type='passive'
                />
              </Box>
            </Box>
            <Box marginY={theme.spacing(2)}>
              <Box display='flex' alignItems='center' gap={theme.spacing(0.5)} marginBottom={theme.spacing(0.5)}>
                <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxt}>
                  {strings.PLANTING_PROGRESS}
                </Typography>
                <Tooltip title={strings.PLANTING_PROGRESS_TOOLTIP}>
                  <Box display='flex' alignItems='center'>
                    <Icon name='info' size='small' fillColor={theme.palette.TwClrIcnSecondary} />
                  </Box>
                </Tooltip>
              </Box>
              <ProgressChart value={0} target={plantingGoal ?? 0} />
            </Box>
            <Box display='flex' gap={theme.spacing(6)} flexWrap='wrap'>
              <Box display='flex' gap={theme.spacing(2)}>
                <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary}>
                  {strings.STRATA}
                </Typography>
                <Box>
                  {strataNames.length > 0 ? (
                    strataNames.map((name) => (
                      <Typography key={name} fontSize='14px' fontWeight={600} color={theme.palette.TwClrTxtSecondary}>
                        {name}
                      </Typography>
                    ))
                  ) : (
                    <Typography fontSize='14px'>{'-'}</Typography>
                  )}
                </Box>
              </Box>
              <Box display='flex' gap={theme.spacing(2)}>
                <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary}>
                  {strings.SUBSTRATA}
                </Typography>
                <Box>
                  {substrataNames.length > 0 ? (
                    substrataNames.map((name) => (
                      <Typography key={name} fontSize='14px' fontWeight={600} color={theme.palette.TwClrTxtSecondary}>
                        {name}
                      </Typography>
                    ))
                  ) : (
                    <Typography fontSize='14px'>{'-'}</Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
          <Box display='flex' gap={theme.spacing(4)} alignItems='flex-start'>
            {numberColumn(strings.PLANTING_GOAL, plantingGoal)}
            {numberColumn(strings.WITHDRAWN_FOR_PLANTING, undefined)}
            {numberColumn(strings.LEFT_TO_PLANT, undefined)}
          </Box>
        </Box>
      </Card>
      <Box marginTop={theme.spacing(3)}>
        <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
      </Box>
    </TfMain>
  );
};

export default PlantingSeasonDetailsView;
