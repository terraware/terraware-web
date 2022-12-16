import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { Batch, NurseryWithdrawal } from 'src/api/types/batch';
import { ServerOrganization } from 'src/types/Organization';
import { Species } from 'src/types/Species';
import { WithdrawalSummary } from '../NurseryWithdrawalsDetails';
import WithdrawalOverview from './WithdrawalOverview';
import NonOutplantWithdrawalTable from './sections/NonOutplantWithdrawalTable';
import Photos from './sections/Photos';

type NonOutplantWithdrawalContentProps = {
  organization: ServerOrganization;
  species: Species[];
  withdrawal?: NurseryWithdrawal;
  withdrawalSummary?: WithdrawalSummary;
  batches?: Batch[];
};

export default function NonOutplantWithdrawalContent({
  organization,
  species,
  withdrawal,
  withdrawalSummary,
  batches,
}: NonOutplantWithdrawalContentProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box display='flex' flexDirection='column'>
      <Typography fontSize='20px' fontWeight={600}>
        {strings.DETAILS}
      </Typography>
      <WithdrawalOverview organization={organization} withdrawal={withdrawal} withdrawalSummary={withdrawalSummary} />
      <Box marginTop={theme.spacing(3)}>
        <NonOutplantWithdrawalTable species={species} withdrawal={withdrawal} batches={batches} />
      </Box>
      <Photos withdrawalId={withdrawal?.id} />
    </Box>
  );
}
