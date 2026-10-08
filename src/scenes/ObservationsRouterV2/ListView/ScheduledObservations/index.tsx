import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Badge, Box, Divider, Drawer, IconButton, Popover, Typography, useTheme } from '@mui/material';
import { Button, Icon, Tooltip } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import { type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useLocalization } from 'src/providers';

import ScheduledObservationItem from './ScheduledObservationItem';
import useUpcomingObservations from './useUpcomingObservations';

const FLYOUT_LIMIT = 3;

type ScheduledObservationsMenuProps = {
  canReschedule: boolean;
  plantingSiteId: PlantingSiteId;
};

const ScheduledObservationsMenu = ({ canReschedule, plantingSiteId }: ScheduledObservationsMenuProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const observations = useUpcomingObservations(plantingSiteId);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
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

  const onButtonClick = useCallback(
    (event?: React.MouseEvent<HTMLElement>) => setAnchorEl(event?.currentTarget ?? null),
    []
  );
  const closeFlyout = useCallback(() => {
    setAnchorEl(null);
    setReschedulingId(undefined);
  }, []);
  const openPanel = useCallback(() => {
    setAnchorEl(null);
    setPanelOpen(true);
  }, []);
  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setReschedulingId(undefined);
  }, []);

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
              margin: 0,
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
              marginTop: theme.spacing(1),
              maxWidth: `calc(100vw - ${theme.spacing(4)})`,
              width: '400px',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Box padding={theme.spacing(2)}>{header(closeFlyout)}</Box>
        {observations.slice(0, FLYOUT_LIMIT).map((observation) => (
          <React.Fragment key={observation.id}>
            <Divider />
            <Box padding={theme.spacing(2)}>
              <ScheduledObservationItem
                canReschedule={canReschedule}
                isRescheduling={reschedulingId === observation.id}
                observation={observation}
                onRescheduleEnd={endReschedule}
                onRescheduleStart={setReschedulingId}
                showSiteName={showSiteName}
              />
            </Box>
          </React.Fragment>
        ))}
        {observations.length > FLYOUT_LIMIT && (
          <>
            <Divider />
            <Box bgcolor={theme.palette.TwClrBgSecondary} padding={theme.spacing(1.5, 2)}>
              <Link fontSize='14px' onClick={openPanel}>
                {strings.formatString(strings.VIEW_ALL_SCHEDULED_OBSERVATIONS, observations.length)}
              </Link>
            </Box>
          </>
        )}
      </Popover>

      <Drawer
        anchor='right'
        disableEnforceFocus
        onClose={closePanel}
        open={panelOpen}
        PaperProps={{ sx: { maxWidth: '100vw', width: { sm: '480px', xs: '100%' } } }}
      >
        <Box padding={theme.spacing(3, 3, 2)}>{header(closePanel)}</Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(2),
            overflowY: 'auto',
            padding: theme.spacing(0, 3, 3),
          }}
        >
          {observations.map((observation) => (
            <Box
              key={observation.id}
              sx={{
                border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                borderRadius: '8px',
                padding: theme.spacing(2),
              }}
            >
              <ScheduledObservationItem
                canReschedule={canReschedule}
                isRescheduling={reschedulingId === observation.id}
                observation={observation}
                onRescheduleEnd={endReschedule}
                onRescheduleStart={setReschedulingId}
                showSiteName={showSiteName}
              />
            </Box>
          ))}
        </Box>
      </Drawer>
    </>
  );
};

export default ScheduledObservationsMenu;
