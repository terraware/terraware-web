import { Box, Typography } from '@mui/material';
import strings from 'src/strings';
import { NurseryWithdrawal } from 'src/api/types/batch';
import { ServerOrganization } from 'src/types/Organization';
import { WithdrawalSummary } from '../NurseryWithdrawalsDetails';
import WithdrawalOverview from './WithdrawalOverview';
import Photos from './sections/Photos';

type DeadOtherContentProps = {
  organization: ServerOrganization;
  withdrawal?: NurseryWithdrawal;
  withdrawalSummary?: WithdrawalSummary;
};

export default function DeadOtherContent({
  organization,
  withdrawal,
  withdrawalSummary,
}: DeadOtherContentProps): JSX.Element {
  return (
    <Box display='flex' flexDirection='column'>
      <Typography fontSize='20px' fontWeight={600}>
        {strings.DETAILS}
      </Typography>
      <WithdrawalOverview organization={organization} withdrawal={withdrawal} withdrawalSummary={withdrawalSummary} />
      <Photos withdrawalId={withdrawal?.id} />
    </Box>
  );
}
