import { Grid } from '@mui/material';
import strings from 'src/strings';
import { NurseryWithdrawal } from 'src/api/types/batch';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { ServerOrganization } from 'src/types/Organization';
import { WithdrawalSummary } from '../NurseryWithdrawalsDetails';

type WithdrawalOverviewProps = {
  organization?: ServerOrganization;
  withdrawal?: NurseryWithdrawal;
  withdrawalSummary?: WithdrawalSummary;
};

export default function WithdrawalOverview({
  organization,
  withdrawal,
  withdrawalSummary,
}: WithdrawalOverviewProps): JSX.Element {
  const { isMobile } = useDeviceInfo();

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
    <Grid container>
      {overviewCardData.map((item) => (
        <Grid item xs={isMobile ? 12 : 4} key={item.title}>
          <OverviewItemCard isEditable={false} title={item.title} contents={item.data} />
        </Grid>
      ))}
    </Grid>
  );
}
