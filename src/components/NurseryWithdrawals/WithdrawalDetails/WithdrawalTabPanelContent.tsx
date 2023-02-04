import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import Photos from './sections/Photos';
import OutplantWithdrawalTable from './sections/OutplantWithdrawalTable';
import { Batch, NurseryWithdrawal } from 'src/api/types/batch';
import { Delivery } from 'src/types/Tracking';
import { Species } from 'src/types/Species';
import { WithdrawalSummary } from '../NurseryWithdrawalsDetails';
import WithdrawalOverview from './WithdrawalOverview';

type WithdrawalTabPanelContentProps = {
  species: Species[];
  plotNames: Record<number, string>;
  withdrawal?: NurseryWithdrawal;
  withdrawalSummary?: WithdrawalSummary;
  delivery?: Delivery;
  batches?: Batch[];
};

export default function WithdrawalTabPanelContent({
  species,
  plotNames,
  withdrawal,
  withdrawalSummary,
  delivery,
}: WithdrawalTabPanelContentProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box display='flex' flexDirection='column'>
      <Typography fontSize='20px' fontWeight={600}>
        {strings.WITHDRAWAL}
      </Typography>
      <WithdrawalOverview withdrawal={withdrawal} withdrawalSummary={withdrawalSummary} />
      <Box marginTop={theme.spacing(3)}>
        <OutplantWithdrawalTable species={species} plotNames={plotNames} delivery={delivery} />
      </Box>
      <Box marginTop={theme.spacing(3)}>
        <Photos withdrawalId={withdrawal?.id} />
      </Box>
    </Box>
  );
}
