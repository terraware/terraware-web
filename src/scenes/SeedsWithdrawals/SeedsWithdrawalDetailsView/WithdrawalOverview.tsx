import React, { type JSX } from 'react';

import { Box, Grid } from '@mui/material';

import Link from 'src/components/common/Link';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { APP_PATHS, VIABILITY_TEST_QUERY_PARAM } from 'src/constants';
import { useLocalization } from 'src/providers';
import { SearchSeedWithdrawalPayload } from 'src/queries/search/seedWithdrawals';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { seedWithdrawalPurposeLabel } from 'src/utils/withdrawalPurposes';

type WithdrawalOverviewProps = {
  withdrawal: SearchSeedWithdrawalPayload;
  batches: { id: number; batchNumber?: string }[];
  seedBankNames: string[];
};

const WithdrawalOverview = ({ withdrawal, batches, seedBankNames }: WithdrawalOverviewProps): JSX.Element => {
  const { strings } = useLocalization();
  const { isMobile } = useDeviceInfo();

  const viabilityTestLink = withdrawal.viabilityTestId ? (
    <Link
      fontSize='16px'
      to={`${APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', String(withdrawal.accessionId))}?${VIABILITY_TEST_QUERY_PARAM}=${withdrawal.viabilityTestId}`}
    >
      {`#${withdrawal.viabilityTestId}`}
    </Link>
  ) : undefined;

  const batchLinks =
    batches.length > 0 ? (
      <Box display='flex' flexWrap='wrap' gap={1}>
        {batches.map((batch) => (
          <Link key={batch.id} fontSize='16px' to={APP_PATHS.INVENTORY_BATCH.replace(':batchId', String(batch.id))}>
            {batch.batchNumber ?? `#${batch.id}`}
          </Link>
        ))}
      </Box>
    ) : undefined;

  const overviewCardData = [
    { title: strings.PURPOSE, contents: seedWithdrawalPurposeLabel(withdrawal.purpose, strings) },
    { title: strings.FROM_SEED_BANK, contents: seedBankNames.join(', ') },
    { title: strings.DESTINATION, contents: withdrawal.destination ?? '' },
    ...(batchLinks ? [{ title: strings.BATCH, contents: batchLinks }] : []),
    ...(viabilityTestLink ? [{ title: strings.VIABILITY_TEST, contents: viabilityTestLink }] : []),
    { title: strings.NOTES, contents: withdrawal.notes ?? '' },
  ];

  return (
    <Grid container>
      {overviewCardData.map((item) => (
        <Grid key={item.title} size={isMobile ? 12 : 4}>
          <OverviewItemCard isEditable={false} title={item.title} contents={item.contents} />
        </Grid>
      ))}
    </Grid>
  );
};

export default WithdrawalOverview;
