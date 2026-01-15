import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { NurseryWithdrawalService } from 'src/services';
import strings from 'src/strings';
import { Batch, NurseryWithdrawal } from 'src/types/Batch';
import { NurseryWithdrawalPurposes } from 'src/types/Batch';
import { Species } from 'src/types/Species';
import { Delivery } from 'src/types/Tracking';
import { isTrue } from 'src/utils/boolean';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useSnackbar from 'src/utils/useSnackbar';
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
  substratumNames: string;
  scientificNames: string[];
  totalWithdrawn: string;
  hasReassignments: boolean;
}

type NurseryWithdrawalsDetailsViewProps = {
  species: Species[];
  substratumNames: Record<number, string>;
};

export default function NurseryWithdrawalsDetailsView({
  species,
  substratumNames,
}: NurseryWithdrawalsDetailsViewProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { withdrawalId } = useParams<{ withdrawalId: string }>();
  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);
  const snackbar = useSnackbar();
  const { OUTPLANT, NURSERY_TRANSFER } = NurseryWithdrawalPurposes;
  const navigate = useSyncNavigate();

  const [withdrawal, setWithdrawal] = useState<NurseryWithdrawal | undefined>(undefined);
  const [withdrawalSummary, setWithdrawalSummary] = useState<WithdrawalSummary | undefined>(undefined);
  const [delivery, setDelivery] = useState<Delivery | undefined>(undefined);
  const [batches, setBatches] = useState<Batch[] | undefined>(undefined);
  const [undoWithdrawalModalOpened, setUndoWithdrawalModalOpened] = useState(false);
  const [reload, setReload] = useState(false);
  const numberFormatter = useNumberFormatter(activeLocale);

  const reloadWithdrawal = () => {
    setReload(true);
  };

  useEffect(() => {
    const updateWithdrawal = async () => {
      const withdrawalResponse = await NurseryWithdrawalService.getNurseryWithdrawal(Number(withdrawalId));
      if (!withdrawalResponse.requestSucceeded || withdrawalResponse.error) {
        setWithdrawal(undefined);
        setDelivery(undefined);
        setBatches(undefined);
        snackbar.toastError();
      } else {
        setWithdrawal(withdrawalResponse.withdrawal);
        setDelivery(withdrawalResponse.delivery);
        setBatches(withdrawalResponse.batches);
      }
      // get summary information
      if (withdrawalId && selectedOrganization) {
        const apiSearchResults = await NurseryWithdrawalService.listNurseryWithdrawals(selectedOrganization.id, [
          {
            operation: 'field',
            field: 'id',
            type: 'Exact',
            values: [withdrawalId],
          },
        ]);
        if (apiSearchResults && apiSearchResults.length > 0) {
          const withdrawalSummaryRecord = apiSearchResults[0];
          setWithdrawalSummary({
            id: withdrawalSummaryRecord.id as string,
            delivery_id: withdrawalSummaryRecord.delivery_id as string,
            withdrawnDate: withdrawalSummaryRecord.withdrawnDate as string,
            purpose: withdrawalSummaryRecord.purpose as string,
            facilityName: withdrawalSummaryRecord.facilityName as string,
            destinationName: withdrawalSummaryRecord.destinationName as string,
            substratumNames: withdrawalSummaryRecord.substratumNames as string,
            scientificNames: withdrawalSummaryRecord.speciesScientificNames as string[],
            totalWithdrawn: numberFormatter.format((withdrawalSummaryRecord['totalWithdrawn(raw)'] || 0) as number),
            hasReassignments: isTrue(withdrawalSummaryRecord.hasReassignments),
          });
        }
      }
    };

    void updateWithdrawal();
  }, [selectedOrganization, withdrawalId, snackbar, reload, numberFormatter]);

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
              substratumNames={substratumNames}
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
              substratumNames={substratumNames}
              withdrawal={withdrawal}
              delivery={delivery}
              batches={batches}
            />
          </Box>
        ),
      },
    ];
  }, [species, substratumNames, withdrawal, withdrawalSummary, delivery, batches, activeLocale, isMobile, theme]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'withdrawal',
    tabs,
    viewIdentifier: 'nursery-withdrawal',
  });

  return (
    <TfMain>
      {undoWithdrawalModalOpened && (
        <UndoWithdrawalModal
          onClose={() => setUndoWithdrawalModalOpened(false)}
          row={withdrawalSummary}
          reload={reloadWithdrawal}
        />
      )}
      <PageHeaderWrapper nextElement={contentRef.current} nextElementInitialMargin={-24}>
        <Box marginBottom={theme.spacing(4)}>
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
            padding={isMobile ? theme.spacing(3, 0, 4, 0) : theme.spacing(3, 3, 4, 3)}
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
              substratumNames={substratumNames}
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
