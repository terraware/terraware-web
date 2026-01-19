import React, { type JSX } from 'react';

import { Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import strings from 'src/strings';

import NurseryWithdrawalsTable from './NurseryWithdrawalsTable';

export default function NurseryWithdrawalsTabContent(): JSX.Element {
  const theme = useTheme();

  return (
    <Card flushMobile>
      <Typography
        sx={{
          fontSize: '20px',
          fontWeight: 600,
          color: theme.palette.TwClrTxt,
          marginBottom: theme.spacing(2),
        }}
      >
        {strings.WITHDRAWAL_HISTORY}
      </Typography>
      <NurseryWithdrawalsTable />
    </Card>
  );
}
