import React, { Box, Theme, Typography, useTheme } from '@mui/material';
import { Property } from 'csstype';

import strings from 'src/strings';
import { ToDoBadge } from 'src/types/ProjectToDo';

interface ToDoStatusBadgeProps {
  status: ToDoBadge;
}

const getToDoStatus = (status: ToDoBadge): string => {
  switch (status) {
    case 'Not Submitted':
      return strings.NOT_SUBMITTED;
    case 'Event':
      return strings.EVENT;
    case 'In Review':
      return strings.IN_REVIEW;
    case 'Not Accepted':
      return strings.NOT_ACCEPTED;
    case 'Overdue':
      return strings.OVERDUE;
    case 'Completed':
    default:
      return '';
  }
};

type StatusColors = {
  background: Property.Color | undefined;
  border: Property.Color | undefined;
  text: Property.Color | undefined;
};

const getStatusColors = (status: ToDoBadge, theme: Theme): StatusColors => {
  switch (status) {
    case 'In Review':
      return {
        background: theme.palette.TwClrBgWarningTertiary,
        border: theme.palette.TwClrBrdrWarning,
        text: theme.palette.TwClrTxtWarning,
      };
    case 'Not Accepted':
    case 'Overdue':
      return {
        background: theme.palette.TwClrBgDangerTertiary,
        border: theme.palette.TwClrBrdrDanger,
        text: theme.palette.TwClrTxtDanger,
      };
    case 'Completed':
    case 'Not Submitted':
    case 'Event':
    default:
      return {
        background: theme.palette.TwClrBgInfoTertiary,
        border: theme.palette.TwClrBrdrInfo,
        text: theme.palette.TwClrTxtInfo,
      };
  }
};

const ToDoStatusBadge = ({ status }: ToDoStatusBadgeProps) => {
  const theme = useTheme();
  const statusColors = getStatusColors(status, theme);

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
        {getToDoStatus(status)}
      </Typography>
    </Box>
  );
};

export default ToDoStatusBadge;
