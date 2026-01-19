import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';

import { DocumentStatus } from 'src/types/documentProducer/Document';

type StatusBadgeProps = {
  status: DocumentStatus;
};

const StatusBadge = ({ status }: StatusBadgeProps): JSX.Element => {
  const theme = useTheme();

  // Seems a bit redundant to make the default the same as "Draft" but wanted to leave it like this
  // in the event that we create new statuses in the future, which seems likely
  let color = theme.palette.TwClrBaseGray500;
  let backgroundColor = theme.palette.TwClrBaseGray050;

  switch (status) {
    case 'Draft':
      color = theme.palette.TwClrBaseGray500;
      backgroundColor = theme.palette.TwClrBaseGray050;
      break;
    case 'Submitted':
      color = theme.palette.TwClrBaseOrange500;
      backgroundColor = theme.palette.TwClrBaseOrange050;
      break;
  }

  return (
    <Box
      // Had to go with <span> and `display: block` because this normally creates a <div> which can't live
      // inside a <p>, which is what the CellRenderer wraps this in
      component={'span'}
      sx={{
        display: 'block',
        borderRadius: '8px',
        border: `1px solid ${color}`,
        backgroundColor,
        color,
        fontSize: '14px',
        padding: theme.spacing(0.5, 1),
        lineHeight: '20px',
        fontWeight: '600',
        height: 'fit-content',
        width: 'fit-content',
      }}
    >
      {status}
    </Box>
  );
};

export default StatusBadge;
