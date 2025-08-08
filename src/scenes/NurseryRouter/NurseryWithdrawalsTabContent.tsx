import React, { Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import strings from 'src/strings';
import { SearchResponseElement } from 'src/types/Search';

import NurseryWithdrawalsTable from './NurseryWithdrawalsTable';

export default function NurseryWithdrawalsTabContent({
  rows,
  setRows,
}: {
  rows: SearchResponseElement[] | null | undefined;
  setRows: (rows: SearchResponseElement[] | null) => void;
}): JSX.Element {
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
      <NurseryWithdrawalsTable rows={rows} setRows={setRows} />
    </Card>
  );
}
