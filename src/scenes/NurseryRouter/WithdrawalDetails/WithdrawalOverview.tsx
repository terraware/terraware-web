import React, { type JSX } from 'react';

import { Grid } from '@mui/material';

import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { useOrganization } from 'src/providers/hooks';
import strings from 'src/strings';
import { NurseryWithdrawal } from 'src/types/Batch';
import { purposeLabel } from 'src/types/Batch';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import { WithdrawalSummary } from '../NurseryWithdrawalsDetailsView';

type WithdrawalOverviewProps = {
  withdrawal?: NurseryWithdrawal;
  withdrawalSummary?: WithdrawalSummary;
};

export default function WithdrawalOverview({ withdrawal, withdrawalSummary }: WithdrawalOverviewProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();

  const facilityName = selectedOrganization?.facilities?.find((f) => f.id === withdrawal?.facilityId)?.name;
  const overviewCardData = [
    {
      title: strings.DATE,
      data: withdrawal?.withdrawnDate ?? '',
    },
    {
      title: strings.PURPOSE,
      data: withdrawal?.purpose ? purposeLabel(withdrawal.purpose) : '',
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
      title: strings.TO_SUBSTRATUM,
      data: withdrawalSummary?.substratumNames ?? '',
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
