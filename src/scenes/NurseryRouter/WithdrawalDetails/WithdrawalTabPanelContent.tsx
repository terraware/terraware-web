import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import strings from 'src/strings';
import { Batch, NurseryWithdrawal } from 'src/types/Batch';
import { Species } from 'src/types/Species';
import { Delivery } from 'src/types/Tracking';

import { WithdrawalSummary } from '../NurseryWithdrawalsDetailsView';
import WithdrawalOverview from './WithdrawalOverview';
import OutplantWithdrawalTable from './sections/OutplantWithdrawalTable';
import Photos from './sections/Photos';

type WithdrawalTabPanelContentProps = {
  species: Species[];
  substratumNames: Record<number, string>;
  withdrawal?: NurseryWithdrawal;
  withdrawalSummary?: WithdrawalSummary;
  delivery?: Delivery;
  batches?: Batch[];
};

export default function WithdrawalTabPanelContent({
  species,
  substratumNames,
  withdrawal,
  withdrawalSummary,
  delivery,
  batches,
}: WithdrawalTabPanelContentProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box display='flex' flexDirection='column'>
      <Typography fontSize='20px' fontWeight={600}>
        {strings.WITHDRAWAL}
      </Typography>
      <WithdrawalOverview withdrawal={withdrawal} withdrawalSummary={withdrawalSummary} />
      <Box marginTop={theme.spacing(3)}>
        <OutplantWithdrawalTable
          species={species}
          substratumNames={substratumNames}
          delivery={delivery}
          batches={batches}
          withdrawal={withdrawal}
        />
      </Box>
      <Box marginTop={theme.spacing(3)}>
        <Photos withdrawalId={withdrawal?.id} />
      </Box>
    </Box>
  );
}
