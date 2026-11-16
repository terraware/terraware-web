import React, { type JSX, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import BackToLink from 'src/components/common/BackToLink';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { useLazyListWithdrawalCreationsQuery } from 'src/queries/accessions/events';
import { useLazySearchSeedWithdrawalsQuery } from 'src/queries/search/seedWithdrawals';
import { findWithdrawalGroupIds, isGroupedPurpose } from 'src/scenes/SeedsWithdrawals/withdrawalGroup';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import Photos from './Photos';
import WithdrawalAccessionsTable from './WithdrawalAccessionsTable';
import WithdrawalOverview from './WithdrawalOverview';

const SeedsWithdrawalDetailsView = (): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const contentRef = useRef(null);

  const params = useParams<{ withdrawalId: string }>();
  const withdrawalId = Number(params.withdrawalId);
  const organizationId = selectedOrganization?.id;

  const [searchAnchor, searchAnchorResponse] = useLazySearchSeedWithdrawalsQuery();
  const [listCreations, listCreationsResponse] = useLazyListWithdrawalCreationsQuery();
  const [searchGroup, searchGroupResponse] = useLazySearchSeedWithdrawalsQuery();

  useEffect(() => {
    if (organizationId && !Number.isNaN(withdrawalId)) {
      void searchAnchor({ organizationId, withdrawalIds: [withdrawalId], limit: 1 }, true);
    }
  }, [organizationId, searchAnchor, withdrawalId]);

  const anchor = useMemo(() => searchAnchorResponse.currentData?.results?.[0], [searchAnchorResponse.currentData]);

  const isGrouped = anchor !== undefined && isGroupedPurpose(anchor.purpose);

  useEffect(() => {
    if (organizationId && isGrouped) {
      void listCreations({ organizationId }, true);
    }
  }, [isGrouped, listCreations, organizationId]);

  const groupIds = useMemo(() => {
    if (!anchor) {
      return [];
    }
    const creations = listCreationsResponse.currentData;
    // Without the creation history there is nothing to group on, so fall back to showing the
    // withdrawal that was asked for rather than leaving the page empty.
    if (!isGrouped || listCreationsResponse.isError) {
      return [anchor.id];
    }
    return creations ? findWithdrawalGroupIds(creations, anchor.id) : [];
  }, [anchor, isGrouped, listCreationsResponse.currentData, listCreationsResponse.isError]);

  useEffect(() => {
    if (organizationId && groupIds.length > 0) {
      void searchGroup({ organizationId, withdrawalIds: groupIds, limit: groupIds.length }, true);
    }
  }, [groupIds, organizationId, searchGroup]);

  const withdrawals = useMemo(() => {
    const results = searchGroupResponse.currentData?.results ?? [];
    return anchor ? results.filter((withdrawal) => withdrawal.purpose === anchor.purpose) : [];
  }, [anchor, searchGroupResponse.currentData]);

  const batches = useMemo(() => {
    const numbersById = new Map<number, string | undefined>();
    withdrawals.forEach((withdrawal) => {
      if (withdrawal.batchId) {
        numbersById.set(withdrawal.batchId, withdrawal.batchNumber);
      }
    });
    return Array.from(numbersById, ([id, batchNumber]) => ({ id, batchNumber }));
  }, [withdrawals]);

  // A bulk withdrawal can span seed banks, since accessions are selected by species rather than by
  // where they are stored.
  const seedBankNames = useMemo(
    () =>
      Array.from(
        new Set(withdrawals.flatMap((withdrawal) => (withdrawal.seedBankName ? [withdrawal.seedBankName] : [])))
      ),
    [withdrawals]
  );

  const isLoading =
    searchAnchorResponse.isFetching ||
    searchGroupResponse.isFetching ||
    (anchor !== undefined && searchGroupResponse.currentData === undefined && !searchGroupResponse.isError);

  return (
    <TfMain>
      {isLoading && <BusySpinner withSkrim />}
      <PageHeaderWrapper nextElement={contentRef.current} nextElementInitialMargin={-24}>
        <Box marginBottom={theme.spacing(2)}>
          <BackToLink
            id='back'
            to={APP_PATHS.SEEDS_WITHDRAWALS}
            name={strings.WITHDRAWAL_HISTORY}
            style={{ marginLeft: 0, marginTop: theme.spacing(2) }}
          />
          <Box padding={isMobile ? theme.spacing(3, 0, 4, 0) : theme.spacing(3)}>
            <Typography color={theme.palette.TwClrTxt} fontSize='24px' lineHeight='32px' fontWeight={600}>
              {anchor?.date ?? ''}
            </Typography>
          </Box>
          <PageSnackbar />
        </Box>
      </PageHeaderWrapper>
      <div ref={contentRef}>
        <Box
          sx={{
            backgroundColor: theme.palette.TwClrBg,
            borderRadius: '32px',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 'fit-content',
            padding: theme.spacing(3),
          }}
        >
          <Typography fontSize='20px' fontWeight={600}>
            {strings.DETAILS}
          </Typography>
          {anchor && (
            <>
              <WithdrawalOverview withdrawal={anchor} batches={batches} seedBankNames={seedBankNames} />
              <Box marginTop={theme.spacing(3)}>
                <WithdrawalAccessionsTable withdrawals={withdrawals} />
              </Box>
            </>
          )}
          {batches.length > 0 && <Photos batchIds={batches.map((batch) => batch.id)} />}
        </Box>
      </div>
    </TfMain>
  );
};

export default SeedsWithdrawalDetailsView;
