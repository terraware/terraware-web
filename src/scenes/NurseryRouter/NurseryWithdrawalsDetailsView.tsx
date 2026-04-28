import React, { type JSX, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Message, Tabs } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import BackToLink from 'src/components/common/BackToLink';
import OptionsMenu from 'src/components/common/OptionsMenu';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers/hooks';
import { useGetNurseryWithdrawalQuery } from 'src/queries/generated/nurseryWithdrawals';
import { useSearchNurseryWithdrawalsQuery } from 'src/queries/search/nurseries';
import strings from 'src/strings';
import { NurseryWithdrawalPurposes } from 'src/types/Batch';
import { Species } from 'src/types/Species';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useStickyTabs from 'src/utils/useStickyTabs';

import UndoWithdrawalModal from './UndoWithdrawalModal';
import NonOutplantWithdrawalContent from './WithdrawalDetails/NonOutplantWithdrawalContent';
import ReassignmentTabPanelContent from './WithdrawalDetails/ReassignmentTabPanelContent';
import WithdrawalTabPanelContent from './WithdrawalDetails/WithdrawalTabPanelContent';

export interface WithdrawalSummary {
  id: string;
  delivery_id: string;
  withdrawnDate: string;
  purpose: string;
  facilityName: string;
  destinationName: string;
  stratumNames: string;
  substratumShortNames: string;
  scientificNames: string[];
  totalWithdrawn: string;
  hasReassignments: boolean;
}

type NurseryWithdrawalsDetailsViewProps = {
  species: Species[];
};

export default function NurseryWithdrawalsDetailsView({ species }: NurseryWithdrawalsDetailsViewProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const params = useParams<{ withdrawalId: string }>();
  const withdrawalId = Number(params.withdrawalId);

  const getNurseryWithdrawalResponse = useGetNurseryWithdrawalQuery(withdrawalId);
  const getNurserySummaryResponse = useSearchNurseryWithdrawalsQuery({ withdrawalId, limit: 1 });

  const withdrawal = useMemo(
    () => getNurseryWithdrawalResponse.currentData?.withdrawal,
    [getNurseryWithdrawalResponse.currentData?.withdrawal]
  );
  const delivery = useMemo(
    () => getNurseryWithdrawalResponse.currentData?.delivery,
    [getNurseryWithdrawalResponse.currentData?.delivery]
  );
  const batches = useMemo(
    () => getNurseryWithdrawalResponse.currentData?.batches,
    [getNurseryWithdrawalResponse.currentData?.batches]
  );
  const withdrawalSummary = useMemo(() => getNurserySummaryResponse.currentData?.[0], [getNurserySummaryResponse]);

  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);
  const { OUTPLANT, NURSERY_TRANSFER } = NurseryWithdrawalPurposes;
  const navigate = useSyncNavigate();

  const [undoWithdrawalModalOpened, setUndoWithdrawalModalOpened] = useState(false);
  const contentPanelProps = {
    borderRadius: '32px',
    backgroundColor: theme.palette.TwClrBg,
    padding: theme.spacing(3),
    // needed to fit in mobile view
    minWidth: 'fit-content',
  };

  const hasSubstrata = delivery?.plantings?.some((planting) => planting.substratumId) ?? false;

  const handleReassign = () => {
    if (delivery) {
      navigate({
        pathname: APP_PATHS.NURSERY_REASSIGNMENT.replace(':deliveryId', delivery.id.toString()),
        search: '?fromWithdrawal',
      });
    }
  };

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return [
      {
        id: 'withdrawal',
        label: strings.WITHDRAWAL,
        children: (
          <Box
            sx={{
              backgroundColor: theme.palette.TwClrBg,
              borderRadius: isMobile ? '0 0 16px 16px' : '32px',
              padding: theme.spacing(3),
            }}
          >
            <WithdrawalTabPanelContent
              species={species}
              withdrawal={withdrawal}
              withdrawalSummary={withdrawalSummary}
              delivery={delivery}
              batches={batches}
            />
          </Box>
        ),
      },
      {
        id: 'reassignment',
        label: strings.REASSIGNMENT,
        children: (
          <Box
            sx={{
              backgroundColor: theme.palette.TwClrBg,
              borderRadius: isMobile ? '0 0 16px 16px' : '32px',
              padding: theme.spacing(3),
            }}
          >
            <ReassignmentTabPanelContent
              species={species}
              withdrawal={withdrawal}
              delivery={delivery}
              batches={batches}
            />
          </Box>
        ),
      },
    ];
  }, [activeLocale, batches, delivery, isMobile, species, theme, withdrawal, withdrawalSummary]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'withdrawal',
    tabs,
    viewIdentifier: 'nursery-withdrawal',
  });

  return (
    <TfMain>
      {undoWithdrawalModalOpened && withdrawalSummary && (
        <UndoWithdrawalModal onClose={() => setUndoWithdrawalModalOpened(false)} row={withdrawalSummary} />
      )}
      <PageHeaderWrapper nextElement={contentRef.current} nextElementInitialMargin={-24}>
        <Box marginBottom={theme.spacing(2)}>
          <Box>
            <BackToLink
              id='back'
              to={`${APP_PATHS.NURSERY_WITHDRAWALS}?tab=withdrawal_history`}
              name={strings.WITHDRAWAL_HISTORY}
              style={{
                marginLeft: 0,
                marginTop: theme.spacing(2),
              }}
            />
          </Box>
          <Box
            padding={isMobile ? theme.spacing(3, 0, 4, 0) : theme.spacing(3, 3, 3, 3)}
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography color={theme.palette.TwClrTxt} fontSize='24px' lineHeight='32px' fontWeight={600}>
              {withdrawal?.withdrawnDate}
            </Typography>

            {!withdrawal?.undoneByWithdrawalId && (
              <Box>
                {withdrawal?.purpose === OUTPLANT && hasSubstrata && (
                  <Box sx={{ display: 'inline', paddingLeft: 1 }}>
                    <Button
                      size='medium'
                      priority='secondary'
                      onClick={handleReassign}
                      label={strings.REASSIGN}
                      disabled={withdrawalSummary?.hasReassignments}
                    />
                  </Box>
                )}
                {withdrawal?.purpose !== NURSERY_TRANSFER && !withdrawal?.undoesWithdrawalId && (
                  <OptionsMenu
                    onOptionItemClick={() => setUndoWithdrawalModalOpened(true)}
                    optionItems={[{ label: strings.UNDO_WITHDRAWAL, value: 'undo' }]}
                  />
                )}
              </Box>
            )}
          </Box>
          <PageSnackbar />
        </Box>
      </PageHeaderWrapper>
      <div ref={contentRef}>
        {withdrawal?.undoneByWithdrawalId && (
          <Box sx={{ marginTop: 0, marginBottom: 4 }}>
            <Message
              type='page'
              title={strings.WITHDRAWAL_UNDONE}
              priority={'warning'}
              body={strings.UNDONE_WITHDRAWAL_MESSAGE}
            />
          </Box>
        )}
        {withdrawal?.purpose === OUTPLANT && withdrawalSummary?.hasReassignments && (
          <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
        )}
        {withdrawal?.purpose === OUTPLANT && !withdrawalSummary?.hasReassignments && (
          <Box sx={contentPanelProps}>
            <WithdrawalTabPanelContent
              species={species}
              withdrawal={withdrawal}
              withdrawalSummary={withdrawalSummary}
              delivery={delivery}
              batches={batches}
            />
          </Box>
        )}
        {withdrawal?.purpose !== OUTPLANT && (
          <Box sx={contentPanelProps}>
            <NonOutplantWithdrawalContent
              species={species}
              withdrawal={withdrawal}
              withdrawalSummary={withdrawalSummary}
              batches={batches}
            />
          </Box>
        )}
      </div>
    </TfMain>
  );
}
