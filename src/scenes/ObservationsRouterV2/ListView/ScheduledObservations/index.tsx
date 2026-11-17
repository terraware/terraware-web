import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Badge, Box, Drawer, IconButton, Popover, Typography, useTheme } from '@mui/material';
import { Button, Icon, Tooltip } from '@terraware/web-components';

import { type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useLocalization } from 'src/providers';
import { ObservationPayload } from 'src/queries/generated/observations';

import ScheduledObservationItem from './ScheduledObservationItem';
import ScheduledObservationSections from './ScheduledObservationSections';
import useScheduledObservations, { type ScheduledObservationSection } from './useScheduledObservations';

const FLYOUT_LIMIT = 3;

type ScheduledObservationsMenuProps = {
  canReschedule: boolean;
  plantingSiteId: PlantingSiteId;
};

const ScheduledObservationsMenu = ({ canReschedule, plantingSiteId }: ScheduledObservationsMenuProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const scheduledObservations = useScheduledObservations(plantingSiteId);
  const observations = useMemo(
    () => [...scheduledObservations.upcoming, ...scheduledObservations.inProgress, ...scheduledObservations.overdue],
    [scheduledObservations]
  );

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<ScheduledObservationSection | undefined>('upcoming');
  const [reschedulingId, setReschedulingId] = useState<number>();
  const endReschedule = useCallback(() => setReschedulingId(undefined), []);

  const siteNames = useMemo(
    () => [...new Set(observations.map((observation) => observation.plantingSiteName))],
    [observations]
  );
  const showSiteName = typeof plantingSiteId !== 'number';

  const subtitle = useMemo(() => {
    if (siteNames.length === 0) {
      return strings.NO_OBSERVATIONS_HAVE_BEEN_SCHEDULED;
    }
    if (siteNames.length === 1) {
      return strings.formatString(strings.SCHEDULED_OBSERVATIONS_AT_SITE, observations.length.toString(), siteNames[0]);
    }
    return strings.formatString(strings.SCHEDULED_OBSERVATIONS_ACROSS_SITES, observations.length, siteNames.length);
  }, [observations.length, siteNames, strings]);

  const onButtonClick = useCallback((event?: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event?.currentTarget ?? null);
    setExpandedSection('upcoming');
  }, []);
  const closeFlyout = useCallback(() => {
    setAnchorEl(null);
    setReschedulingId(undefined);
  }, []);
  const openPanel = useCallback((section: ScheduledObservationSection) => {
    setAnchorEl(null);
    setExpandedSection(section);
    setPanelOpen(true);
  }, []);
  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setReschedulingId(undefined);
  }, []);

  const toggleSection = useCallback((section: ScheduledObservationSection) => {
    setExpandedSection((current) => (current === section ? undefined : section));
    setReschedulingId(undefined);
  }, []);

  const renderObservation = useCallback(
    (observation: ObservationPayload) => (
      <ScheduledObservationItem
        canReschedule={canReschedule}
        isRescheduling={reschedulingId === observation.id}
        observation={observation}
        onRescheduleEnd={endReschedule}
        onRescheduleStart={setReschedulingId}
        showSiteName={showSiteName}
      />
    ),
    [canReschedule, endReschedule, reschedulingId, showSiteName]
  );

  const sections = (paddingX: number, limit?: number) =>
    observations.length > 0 && (
      <ScheduledObservationSections
        expandedSection={expandedSection}
        limit={limit}
        observations={scheduledObservations}
        onToggle={toggleSection}
        onViewAll={limit === undefined ? undefined : openPanel}
        paddingX={paddingX}
        renderObservation={renderObservation}
      />
    );

  const header = (onClose: () => void) => (
    <Box sx={{ alignItems: 'flex-start', display: 'flex', justifyContent: 'space-between' }}>
      <Box>
        <Typography fontSize='18px' fontWeight={600} lineHeight='26px'>
          {strings.SCHEDULED_OBSERVATIONS}
        </Typography>
        <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' lineHeight='20px'>
          {subtitle}
        </Typography>
      </Box>
      <IconButton aria-label={strings.CLOSE} onClick={onClose} size='small'>
        <Icon name='close' size='medium' />
      </IconButton>
    </Box>
  );

  return (
    <>
      <Tooltip title={strings.SCHEDULED_OBSERVATIONS}>
        <Badge
          badgeContent={observations.length}
          overlap='circular'
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: theme.palette.TwClrBaseOrange700,
              color: theme.palette.TwClrTxtInverse,
              fontWeight: 600,
              pointerEvents: 'none',
              right: 0,
              top: '10px',
            },
          }}
        >
          <Button
            icon='calendar'
            id='scheduled-observations'
            onClick={onButtonClick}
            priority='secondary'
            size='medium'
            sx={{
              '&.button': { margin: 0 },
              ...(anchorEl ? { backgroundColor: theme.palette.TwClrBgBrandTertiary } : {}),
            }}
          />
        </Badge>
      </Tooltip>

      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        disableEnforceFocus
        onClose={closeFlyout}
        open={!!anchorEl}
        slotProps={{
          paper: {
            sx: {
              border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              marginTop: theme.spacing(1),
              maxWidth: `calc(100vw - ${theme.spacing(4)})`,
              overflow: 'hidden',
              width: '400px',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Box flexShrink={0} padding={theme.spacing(2)}>
          {header(closeFlyout)}
        </Box>
        {sections(2, FLYOUT_LIMIT)}
      </Popover>

      <Drawer
        anchor='right'
        disableEnforceFocus
        onClose={closePanel}
        open={panelOpen}
        PaperProps={{ sx: { maxWidth: '100vw', overflow: 'hidden', width: { sm: '480px', xs: '100%' } } }}
      >
        <Box flexShrink={0} padding={theme.spacing(3, 3, 2)}>
          {header(closePanel)}
        </Box>
        {sections(3)}
      </Drawer>
    </>
  );
};

export default ScheduledObservationsMenu;
