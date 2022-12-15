import { Box, Grid, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import Photos from './sections/Photos';
import OutplantWithdrawalTable from './sections/OutplantWithdrawalTable';
import { Batch, NurseryWithdrawal } from 'src/api/types/batch';
import { Delivery } from 'src/api/types/tracking';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { ServerOrganization } from 'src/types/Organization';
import { Species } from 'src/types/Species';
import { WithdrawalSummary } from '../NurseryWithdrawalsDetails';

type WithdrawalTabPanelContentProps = {
  organization: ServerOrganization;
  species: Species[];
  plotNames: Record<number, string>;
  withdrawal?: NurseryWithdrawal;
  withdrawalSummary?: WithdrawalSummary;
  delivery?: Delivery;
  batches?: Batch[];
};

export default function WithdrawalTabPanelContent({
  organization,
  species,
  plotNames,
  withdrawal,
  withdrawalSummary,
  delivery,
}: WithdrawalTabPanelContentProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const facilityName = organization?.facilities?.find((f) => f.id === withdrawal?.facilityId)?.name;
  const overviewCardData = [
    {
      title: strings.DATE,
      data: withdrawal?.withdrawnDate ?? '',
    },
    {
      title: strings.PURPOSE,
      data: withdrawal?.purpose ?? '',
    },
    {
      title: strings.QUANTITY,
      data: withdrawalSummary?.totalWithdrawn?.toString() ?? '',
    },
    {
      title: strings.FROM_NURSERY,
      data: facilityName ?? '',
    },
    {
      title: strings.DESTINATION,
      data: withdrawalSummary?.destinationName ?? '',
    },
    {
      title: strings.TO_PLOT,
      data: withdrawalSummary?.plotNames ?? '',
    },
    {
      title: strings.NOTES,
      data: withdrawal?.notes ?? '',
    },
  ];

  return (
    <Box display='flex' flexDirection='column'>
      <Typography fontSize='20px' fontWeight={600}>
        {strings.WITHDRAWAL}
      </Typography>
      <Grid container>
        {overviewCardData.map(
          (item) =>
            item.data.length > 0 && (
              <Grid item xs={isMobile ? 12 : 4} key={item.title}>
                <OverviewItemCard isEditable={false} title={item.title} contents={item.data} />
              </Grid>
            )
        )}
      </Grid>
      <Box marginTop={theme.spacing(1)}>
        <OutplantWithdrawalTable species={species} plotNames={plotNames} delivery={delivery} />
      </Box>
      <Box marginTop={theme.spacing(4)}>
        <Photos withdrawalId={withdrawal?.id} />
      </Box>
    </Box>
  );
}
