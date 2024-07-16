import React, { Box, Theme, Typography, useTheme } from '@mui/material';
import { Property } from 'csstype';

import strings from 'src/strings';
import { DeliverableStatusType } from 'src/types/Deliverables';

interface DeliverableStatusBadgeProp {
  status: DeliverableStatusType;
  showSimplifiedStatus?: boolean;
}

const getStatusText = (status: DeliverableStatusType, showSimplifiedStatus: boolean): string => {
  if (showSimplifiedStatus) {
    return status === 'Completed' ? strings.COMPLETED : strings.INCOMPLETE;
  }
  switch (status) {
    case 'Not Submitted':
      return strings.INCOMPLETE;
    case 'In Review':
    case 'Needs Translation':
      return strings.IN_REVIEW;
    case 'Completed':
    case 'Approved':
    case 'Not Needed':
      return strings.COMPLETED;
    case 'Rejected':
      return strings.NOT_ACCEPTED;
    default:
      return '';
  }
};

type StatusColors = {
  background: Property.Color | undefined;
  border: Property.Color | undefined;
  text: Property.Color | undefined;
};

const getStatusColors = (status: DeliverableStatusType, theme: Theme, showSimplifiedStatus: boolean): StatusColors => {
  if (showSimplifiedStatus) {
    return status === 'Completed'
      ? {
          background: theme.palette.TwClrBgSuccessTertiary,
          border: theme.palette.TwClrBrdrSuccess,
          text: theme.palette.TwClrTxtSuccess,
        }
      : {
          background: theme.palette.TwClrBgInfoTertiary,
          border: theme.palette.TwClrBrdrInfo,
          text: theme.palette.TwClrTxtInfo,
        };
  }
  switch (status) {
    case 'In Review':
    case 'Needs Translation':
      return {
        background: theme.palette.TwClrBgWarningTertiary,
        border: theme.palette.TwClrBrdrWarning,
        text: theme.palette.TwClrTxtWarning,
      };
    case 'Rejected':
      return {
        background: theme.palette.TwClrBgDangerTertiary,
        border: theme.palette.TwClrBrdrDanger,
        text: theme.palette.TwClrTxtDanger,
      };
    case 'Approved':
    case 'Completed':
    case 'Not Needed':
      return {
        background: theme.palette.TwClrBgSuccessTertiary,
        border: theme.palette.TwClrBrdrSuccess,
        text: theme.palette.TwClrTxtSuccess,
      };
    case 'Not Submitted':
    default:
      return {
        background: theme.palette.TwClrBgInfoTertiary,
        border: theme.palette.TwClrBrdrInfo,
        text: theme.palette.TwClrTxtInfo,
      };
  }
};

const DeliverableStatusBadge = ({ status, showSimplifiedStatus = false }: DeliverableStatusBadgeProp) => {
  const theme = useTheme();
  const statusColors = getStatusColors(status, theme, showSimplifiedStatus);

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
        {getStatusText(status, showSimplifiedStatus)}
      </Typography>
    </Box>
  );
};

export default DeliverableStatusBadge;
