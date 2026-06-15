import React, { type JSX, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Tooltip, Typography, useTheme } from '@mui/material';
import { Button, DropdownItem, Icon, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageSnackbar from 'src/components/PageSnackbar';
import BackToLink from 'src/components/common/BackToLink';
import Card from 'src/components/common/Card';
import ProgressChart from 'src/components/common/Chart/ProgressChart';
import Link from 'src/components/common/Link';
import OptionsMenu from 'src/components/common/OptionsMenu';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import {
  useClosePlantingSeasonMutation,
  useDeletePlantingSeasonMutation,
  useLazyGetPlantingSeasonQuery,
  useLazyGetSpeciesTargetsQuery,
} from 'src/queries/generated/plantingSeasons';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { useGetPlantingSeasonSpeciesSummaryQuery } from 'src/queries/search/plantingSeasons';
import strings from 'src/strings';
import { getMediumDate } from 'src/utils/dateFormatter';
import useSnackbar from 'src/utils/useSnackbar';
import useStickyTabs from 'src/utils/useStickyTabs';

import ClosePlantingSeasonModal from './ClosePlantingSeasonModal';
import DeletePlantingSeasonModal from './DeletePlantingSeasonModal';
import EditPlantingSeasonModal from './EditPlantingSeasonModal';
import PlantingDatesTab from './PlantingDatesTab';
import PlantingSeasonStatusBadge from './PlantingSeasonStatusBadge';
import SpeciesSummaryDrawer from './SpeciesSummaryDrawer';
import SpeciesTargetsTab from './SpeciesTargetsTab';

const PlantingSeasonDetailsView = (): JSX.Element => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const { plantingSeasonId } = useParams<{ plantingSeasonId: string }>();
  const seasonIdNumber = Number(plantingSeasonId);

  const [getPlantingSeason, { data: plantingSeasonData }] = useLazyGetPlantingSeasonQuery();
  const [getPlantingSite, { data: plantingSiteData }] = useLazyGetPlantingSiteQuery();
  const [getSpeciesTargets, { data: speciesTargets }] = useLazyGetSpeciesTargetsQuery();
  const { data: speciesSummary } = useGetPlantingSeasonSpeciesSummaryQuery(seasonIdNumber, { skip: !plantingSeasonId });

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [speciesSummaryOpen, setSpeciesSummaryOpen] = useState(false);

  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const [deletePlantingSeason, { isLoading: isDeleting }] = useDeletePlantingSeasonMutation();
  const [closePlantingSeason, { isLoading: isClosing }] = useClosePlantingSeasonMutation();

  const onConfirmDelete = async () => {
    try {
      await deletePlantingSeason(seasonIdNumber).unwrap();
      setDeleteModalOpen(false);
      navigate(APP_PATHS.PLANTING_SEASONS);
    } catch (e) {
      snackbar.toastError();
    }
  };

  const onConfirmClose = async () => {
    try {
      await closePlantingSeason(seasonIdNumber).unwrap();
      setCloseModalOpen(false);
    } catch (e) {
      snackbar.toastError();
    }
  };

  const isClosed = plantingSeasonData?.season?.status === 'Closed';

  const optionItems = useMemo<DropdownItem[]>(
    () => [
      { label: strings.DELETE_PLANTING_SEASON, value: 'delete' },
      ...(isClosed ? [] : [{ label: strings.CLOSE_PLANTING_SEASON, value: 'close' }]),
    ],
    [isClosed]
  );

  const onOptionItemClick = (item: DropdownItem) => {
    if (item.value === 'delete') {
      setDeleteModalOpen(true);
    } else if (item.value === 'close') {
      setCloseModalOpen(true);
    }
  };

  const plantingGoal = useMemo(() => {
    if (speciesSummary && speciesSummary.length > 0) {
      return speciesSummary.reduce((sum, target) => sum + target.target, 0);
    }

    const targets = speciesTargets?.targets;
    if (!targets || targets.length === 0) {
      return undefined;
    }
    return targets.reduce((sum, t) => sum + t.quantity, 0);
  }, [speciesSummary, speciesTargets]);

  const withdrawnForPlantingTotal = useMemo(() => {
    if (!speciesSummary || speciesSummary.length === 0) {
      return undefined;
    }
    return speciesSummary.reduce((sum, target) => sum + target.withdrawn, 0);
  }, [speciesSummary]);

  const leftToPlantTotal = useMemo(() => {
    if (!speciesSummary || speciesSummary.length === 0) {
      return undefined;
    }
    return speciesSummary.reduce((sum, target) => sum + target.leftToPlant, 0);
  }, [speciesSummary]);

  const hasSpeciesTargets = (speciesTargets?.targets.length ?? 0) > 0;

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
      <Typography fontSize='14px' color={theme.palette.TwClrBaseBlack} fontWeight={500}>
        {label}
      </Typography>
      <Typography fontSize='24px' fontWeight={600} color={theme.palette.TwClrBaseBlack}>
        {value === undefined ? '-' : value.toLocaleString(activeLocale || undefined)}
      </Typography>
    </Box>
  );

  const tabs = useMemo(
    () => [
      {
        id: 'species-targets',
        label: strings.SPECIES_TARGETS,
        children:
          season && plantingSite ? <SpeciesTargetsTab plantingSeason={season} plantingSite={plantingSite} /> : <Box />,
      },
      {
        id: 'planting-dates',
        label: strings.PLANTING_DATES,
        children:
          season && plantingSite ? <PlantingDatesTab plantingSeason={season} plantingSite={plantingSite} /> : <Box />,
      },
    ],
    [season, plantingSite]
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
      <DeletePlantingSeasonModal
        open={deleteModalOpen}
        seasonName={season.name}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => void onConfirmDelete()}
        busy={isDeleting}
      />
      <ClosePlantingSeasonModal
        open={closeModalOpen}
        seasonName={season.name}
        onClose={() => setCloseModalOpen(false)}
        onConfirm={() => void onConfirmClose()}
        busy={isClosing}
      />
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
              {!isClosed && (
                <Button
                  icon='iconEdit'
                  onClick={() => setEditModalOpen(true)}
                  priority='ghost'
                  size='small'
                  type='passive'
                />
              )}
              <PlantingSeasonStatusBadge status={season.status} />
            </Box>
            <Box display='flex' alignItems='center' gap={theme.spacing(2)} marginTop={theme.spacing(1)}>
              <Typography color={theme.palette.TwClrTxtSecondary}>{plantingSite.name}</Typography>
              <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
                <Typography color={theme.palette.TwClrTxt}>{dateRange}</Typography>
                {!isClosed && (
                  <Button
                    icon='iconEdit'
                    onClick={() => setEditModalOpen(true)}
                    priority='ghost'
                    size='small'
                    type='passive'
                  />
                )}
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
                    <Box display='flex' flexDirection='column'>
                      {Array.from({ length: Math.ceil(substrataNames.length / 2) }, (_, i) => {
                        const pair = substrataNames.slice(i * 2, i * 2 + 2);
                        return (
                          <Box key={i} display='flex' gap='8px'>
                            {pair.map((name) => (
                              <Typography
                                key={name}
                                fontSize='14px'
                                fontWeight={600}
                                color={theme.palette.TwClrTxtSecondary}
                              >
                                {name}
                              </Typography>
                            ))}
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography fontSize='14px'>{'-'}</Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
          <Box display='flex' flexDirection='column' alignItems='flex-end' gap={theme.spacing(2)}>
            <Box display='flex' gap={theme.spacing(4)} alignItems='flex-start'>
              {numberColumn(strings.PLANTING_GOAL, plantingGoal)}
              {numberColumn(strings.WITHDRAWN_FOR_PLANTING, withdrawnForPlantingTotal)}
              {numberColumn(strings.LEFT_TO_PLANT, leftToPlantTotal)}
              <OptionsMenu
                optionItems={optionItems}
                onOptionItemClick={onOptionItemClick}
                size='small'
                priority='ghost'
                type='passive'
              />
            </Box>
            {hasSpeciesTargets && (
              <Link
                style={{ fontSize: '16px', textDecoration: 'underline' }}
                onClick={() => setSpeciesSummaryOpen(true)}
              >
                {strings.SPECIES_SUMMARY}
              </Link>
            )}
          </Box>
        </Box>
      </Card>
      <SpeciesSummaryDrawer
        open={speciesSummaryOpen}
        onClose={() => setSpeciesSummaryOpen(false)}
        plantingSeasonId={seasonIdNumber}
      />
      <Box marginTop={theme.spacing(3)}>
        <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
      </Box>
    </TfMain>
  );
};

export default PlantingSeasonDetailsView;
