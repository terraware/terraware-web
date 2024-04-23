import React, { Box, Theme, Typography, useTheme } from '@mui/material';
import { Property } from 'csstype';

import strings from 'src/strings';

import { ToDoType } from './ToDo';

interface ToDoStatusBadgeProps {
  status: ToDoType['status'];
}

// TODO this will move to the appropriate types area when the BE for ToDos is fleshed out
const getToDoStatus = (status: ToDoType['status']): string => {
  switch (status) {
    case 'Event':
      return strings.EVENT;
    case 'Not Submitted':
      return strings.NOT_SUBMITTED;
    case 'Overdue':
      return strings.OVERDUE;
    default:
      return `${status}`;
  }
};

type StatusColors = {
  background: Property.Color | undefined;
  border: Property.Color | undefined;
  text: Property.Color | undefined;
};

const getStatusColors = (status: ToDoType['status'], theme: Theme): StatusColors => {
  switch (status) {
    case 'Overdue':
      return {
        background: theme.palette.TwClrBgDangerTertiary,
        border: theme.palette.TwClrBrdrDanger,
        text: theme.palette.TwClrTxtDanger,
      };
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
