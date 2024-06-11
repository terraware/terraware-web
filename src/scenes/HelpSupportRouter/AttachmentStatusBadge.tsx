import React, { useMemo } from 'react';

import { Box, Theme, Typography, useTheme } from '@mui/material';
import { Property } from 'csstype';

import { useLocalization } from 'src/providers';
import { Statuses } from 'src/redux/features/asyncUtils';
import strings from 'src/strings';

type StatusColors = {
  background: Property.Color | undefined;
  border: Property.Color | undefined;
  text: Property.Color | undefined;
};

const getStatusColors = (status: Statuses, theme: Theme): StatusColors => {
  switch (status) {
    case 'pending':
      return {
        background: theme.palette.TwClrBgWarningTertiary,
        border: theme.palette.TwClrBrdrWarning,
        text: theme.palette.TwClrTxtWarning,
      };
    case 'partial-success':
    case 'error':
      return {
        background: theme.palette.TwClrBgDangerTertiary,
        border: theme.palette.TwClrBrdrDanger,
        text: theme.palette.TwClrTxtDanger,
      };
    case 'success':
      return {
        background: theme.palette.TwClrBgSuccessTertiary,
        border: theme.palette.TwClrBrdrSuccess,
        text: theme.palette.TwClrTxtSuccess,
      };
  }
};

const getStatusText = (status: Statuses): string => {
  switch (status) {
    case 'pending':
      return strings.IN_PROGRESS;
    case 'error':
    case 'partial-success':
      return strings.ERROR;
    case 'success':
      return strings.SUCCESS;
  }
};

type AttachmentStatusBadgeProps = {
  status: Statuses;
};

const AttachmentStatusBadge = ({ status }: AttachmentStatusBadgeProps) => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const statusColors = useMemo(() => getStatusColors(status, theme), [status, theme]);
  const statusText = useMemo(() => getStatusText(status), [status, activeLocale]);

  return (
    <Box
      sx={{
        border: `1px solid ${statusColors.border}`,
        color: statusColors.text,
        backgroundColor: statusColors.background,
        borderRadius: theme.spacing(1),
        width: 'fit-content',
        padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
      }}
    >
      <Typography fontSize={'14px'} fontWeight={500} lineHeight={'20px'} whiteSpace={'nowrap'}>
        {statusText}
      </Typography>
    </Box>
  );
};

export default AttachmentStatusBadge;
