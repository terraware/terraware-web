import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { DeliveryPayload } from 'src/queries/generated/deliveries';
import { BatchPayload, NurseryWithdrawalPayload } from 'src/queries/generated/nurseryWithdrawals';
import { SearchNurseryWithdrawalPayload } from 'src/queries/search/nurseries';
import strings from 'src/strings';
import { Species } from 'src/types/Species';

import WithdrawalOverview from './WithdrawalOverview';
import OutplantWithdrawalTable from './sections/OutplantWithdrawalTable';
import Photos from './sections/Photos';

type WithdrawalTabPanelContentProps = {
  species: Species[];
  withdrawal?: NurseryWithdrawalPayload;
  withdrawalSummary?: SearchNurseryWithdrawalPayload;
  delivery?: DeliveryPayload;
  batches?: BatchPayload[];
  reassignmentDeliveries?: DeliveryPayload[];
};

export default function WithdrawalTabPanelContent({
  species,
  withdrawal,
  withdrawalSummary,
  delivery,
  batches,
  reassignmentDeliveries,
}: WithdrawalTabPanelContentProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box display='flex' flexDirection='column'>
      <Typography fontSize='20px' fontWeight={600}>
        {strings.WITHDRAWAL}
      </Typography>
      <WithdrawalOverview
        withdrawal={withdrawal}
        withdrawalSummary={withdrawalSummary}
        delivery={delivery}
        reassignmentDeliveries={reassignmentDeliveries}
      />
      <Box marginTop={theme.spacing(3)}>
        <OutplantWithdrawalTable species={species} delivery={delivery} batches={batches} withdrawal={withdrawal} />
      </Box>
      <Box marginTop={theme.spacing(3)}>
        <Photos withdrawalId={withdrawal?.id} />
      </Box>
    </Box>
  );
}
