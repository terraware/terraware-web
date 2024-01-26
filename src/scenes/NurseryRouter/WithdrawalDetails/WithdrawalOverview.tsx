import { Grid } from '@mui/material';
import strings from 'src/strings';
import { NurseryWithdrawal } from 'src/types/Batch';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { WithdrawalSummary } from '../NurseryWithdrawalsDetailsView';
import { useOrganization } from 'src/providers/hooks';
import { NurseryWithdrawalPurpose, purposeLabel } from 'src/types/Batch';

type WithdrawalOverviewProps = {
  withdrawal?: NurseryWithdrawal;
  withdrawalSummary?: WithdrawalSummary;
};

export default function WithdrawalOverview({ withdrawal, withdrawalSummary }: WithdrawalOverviewProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();

  const facilityName = selectedOrganization.facilities?.find((f) => f.id === withdrawal?.facilityId)?.name;
  const overviewCardData = [
    {
      title: strings.DATE,
      data: withdrawal?.withdrawnDate ?? '',
    },
    {
      title: strings.PURPOSE,
      data: withdrawal?.purpose ? purposeLabel(withdrawal.purpose as NurseryWithdrawalPurpose) : '',
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
      title: strings.TO_SUBZONE,
      data: withdrawalSummary?.subzoneNames ?? '',
    },
    {
      title: strings.NOTES,
      data: withdrawal?.notes ?? '',
    },
  ];

  return (
    <Grid container>
      {overviewCardData.map((item) => (
        <Grid item xs={isMobile ? 12 : 4} key={item.title}>
          <OverviewItemCard isEditable={false} title={item.title} contents={item.data} />
        </Grid>
      ))}
    </Grid>
  );
}
