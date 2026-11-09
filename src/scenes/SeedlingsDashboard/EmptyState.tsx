import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Button from 'src/components/common/button/Button';
import Icon from 'src/components/common/icon/Icon';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import { isAdmin, selectedOrgHasFacilityType } from 'src/utils/organization';

export default function EmptyState(): JSX.Element {
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const navigate = useSyncNavigate();
  const theme = useTheme();
  const hasNursery = !!selectedOrganization && selectedOrgHasFacilityType(selectedOrganization, 'Nursery');
  const canSetUpNursery = isAdmin(selectedOrganization);
  const destination = hasNursery
    ? APP_PATHS.INVENTORY_NEW
    : canSetUpNursery
      ? APP_PATHS.NURSERIES_NEW
      : APP_PATHS.INVENTORY;

  return (
    <Box
      role='status'
      sx={{
        background: theme.palette.TwClrBgInfoTertiary,
        border: `1px solid ${theme.palette.TwClrBrdrInfo}`,
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'start',
        padding: theme.spacing(2.25),
        gap: theme.spacing(2.25),
      }}
    >
      <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='large' style={{ flexShrink: 0 }} />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 1 }}>
        <Typography fontWeight={600}>{strings.SEEDLINGS_DASHBOARD_MESSAGE_TITLE}</Typography>
        <Typography>{strings.SEEDLINGS_DASHBOARD_MESSAGE}</Typography>
        <Box sx={{ alignSelf: 'end', marginTop: theme.spacing(1) }}>
          <Button
            label={!hasNursery && canSetUpNursery ? strings.SET_UP_NURSERY : strings.ADD_INVENTORY}
            onClick={() => navigate(destination)}
          />
        </Box>
      </Box>
    </Box>
  );
}
