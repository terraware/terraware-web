import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { useLocalization } from 'src/providers';
import { BatchPayload, NurseryWithdrawalPayload } from 'src/queries/generated/nurseryWithdrawals';
import { SearchNurseryWithdrawalPayload } from 'src/queries/search/nurseries';
import { Species } from 'src/types/Species';

import WithdrawalOverview from './WithdrawalOverview';
import NonOutplantWithdrawalTable from './sections/NonOutplantWithdrawalTable';
import Photos from './sections/Photos';

type NonOutplantWithdrawalContentProps = {
  species: Species[];
  withdrawal?: NurseryWithdrawalPayload;
  withdrawalSummary?: SearchNurseryWithdrawalPayload;
  batches?: BatchPayload[];
};

export default function NonOutplantWithdrawalContent({
  species,
  withdrawal,
  withdrawalSummary,
  batches,
}: NonOutplantWithdrawalContentProps): JSX.Element {
  const theme = useTheme();
  const { strings } = useLocalization();

  return (
    <Box display='flex' flexDirection='column'>
      <Typography fontSize='20px' fontWeight={600}>
        {strings.DETAILS}
      </Typography>
      <WithdrawalOverview withdrawal={withdrawal} withdrawalSummary={withdrawalSummary} />
      <Box marginTop={theme.spacing(3)}>
        <NonOutplantWithdrawalTable species={species} withdrawal={withdrawal} batches={batches} />
      </Box>
      <Photos withdrawalId={withdrawal?.id} />
    </Box>
  );
}
