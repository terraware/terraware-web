import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import Photos from './sections/Photos';
import OutplantWithdrawalTable from './sections/OutplantWithdrawalTable';
import { Batch, NurseryWithdrawal } from 'src/types/Batch';
import { Delivery } from 'src/types/Tracking';
import { Species } from 'src/types/Species';
import { WithdrawalSummary } from '../NurseryWithdrawalsDetailsView';
import WithdrawalOverview from './WithdrawalOverview';

type WithdrawalTabPanelContentProps = {
  species: Species[];
  plantingSubzoneNames: Record<number, string>;
  withdrawal?: NurseryWithdrawal;
  withdrawalSummary?: WithdrawalSummary;
  delivery?: Delivery;
  batches?: Batch[];
};

export default function WithdrawalTabPanelContent({
  species,
  plantingSubzoneNames,
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
          subzoneNames={plantingSubzoneNames}
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
