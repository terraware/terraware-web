import React, { useEffect, useState } from 'react';

import { Typography } from '@mui/material';
import { BusySpinner, theme } from '@terraware/web-components';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';

import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import { NurseryBatchService, NurseryWithdrawalService } from 'src/services';
import strings from 'src/strings';
import { NurseryWithdrawal, NurseryWithdrawalRequest, NurseryWithdrawalRequestPurposes } from 'src/types/Batch';
import { SearchResponseElement } from 'src/types/Search';
import { isContributor } from 'src/utils/organization';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import EmptyBatchesInfoModal from './EmptyBatchesInfoModal';
import AddPhotos from './flow/AddPhotos';
import SelectBatchesWithdrawnQuantity from './flow/SelectBatchesWithdrawnQuantity';
import SelectPurposeForm from './flow/SelectPurposeForm';

type FlowStates = 'purpose' | 'select batches' | 'photos';

type BatchWithdrawFlowProps = {
  batchIds: string[];
  sourcePage?: string;
  withdrawalCreatedCallback?: () => void;
};

export default function BatchWithdrawFlow(props: BatchWithdrawFlowProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { batchIds, sourcePage, withdrawalCreatedCallback } = props;
  const { OUTPLANT, NURSERY_TRANSFER } = NurseryWithdrawalRequestPurposes;
  const [flowState, setFlowState] = useState<FlowStates>('purpose');
  const [record, setRecord] = useForm<NurseryWithdrawalRequest>({
    batchWithdrawals: [],
    facilityId: -1,
    purpose: isContributor(selectedOrganization) ? NURSERY_TRANSFER : OUTPLANT,
    withdrawnDate: getTodaysDateFormatted(),
  });
  const [batches, setBatches] = useState<SearchResponseElement[]>();
  const [showEmptyBatchesModalFor, setShowEmptyBatchesModalFor] = useState<NurseryWithdrawal | null>(null);
  const [filterProjectId, setFilterProjectId] = useState<number>();
  const snackbar = useSnackbar();
  const navigate = useSyncNavigate();

  useEffect(() => {
    if (selectedOrganization) {
      const populateBatches = async () => {
        const searchResponse: SearchResponseElement[] | null = await NurseryBatchService.getBatches(
          selectedOrganization.id,
          batchIds.map((id) => Number(id))
        );

        if (searchResponse) {
          const withdrawable = searchResponse.filter(
            (batch: any) => +batch['totalQuantity(raw)'] + +batch['germinatingQuantity(raw)'] > 0
          );
          if (!withdrawable.length) {
            snackbar.toastError(strings.NO_BATCHES_TO_WITHDRAW_FROM); // temporary until we have a solution from design
          }
          setBatches(withdrawable);
        }
      };
      void populateBatches();
    }
  }, [batchIds, snackbar, selectedOrganization]);

  const onWithdrawalConfigured = (withdrawal: NurseryWithdrawalRequest) => {
    setRecord(withdrawal);
    if (batches?.length === 1) {
      setFlowState('photos');
    } else {
      setFlowState('select batches');
    }
  };

  const onBatchesSelected = (withdrawal: NurseryWithdrawalRequest) => {
    setRecord(withdrawal);
    setFlowState('photos');
  };

  const withdraw = async (photos: File[]) => {
    // first create the withdrawal
    record.batchWithdrawals = record.batchWithdrawals
      .map((batchWithdrawal) => {
        const {
          readyQuantityWithdrawn,
          activeGrowthQuantityWithdrawn,
          hardeningOffQuantityWithdrawn,
          germinatingQuantityWithdrawn,
        } = batchWithdrawal;

        return {
          ...batchWithdrawal,
          readyQuantityWithdrawn: isNaN(readyQuantityWithdrawn) ? 0 : readyQuantityWithdrawn,
          activeGrowthQuantityWithdrawn: isNaN(activeGrowthQuantityWithdrawn) ? 0 : activeGrowthQuantityWithdrawn,
          hardeningOffQuantityWithdrawn: isNaN(hardeningOffQuantityWithdrawn) ? 0 : hardeningOffQuantityWithdrawn,
          // germinating quantity can be undefined in the payload, hence different handling
          germinatingQuantityWithdrawn:
            germinatingQuantityWithdrawn && isNaN(germinatingQuantityWithdrawn) ? 0 : germinatingQuantityWithdrawn,
        };
      })
      .filter((batchWithdrawal) => {
        return (
          batchWithdrawal.readyQuantityWithdrawn +
            batchWithdrawal.activeGrowthQuantityWithdrawn +
            batchWithdrawal.hardeningOffQuantityWithdrawn +
            (batchWithdrawal.germinatingQuantityWithdrawn ?? 0) >
          0
        );
      });

    if (record.batchWithdrawals.length === 0) {
      snackbar.toastError(strings.NO_BATCHES_TO_WITHDRAW_FROM); // temporary until we have a solution from design
      return;
    }

    const response = await NurseryWithdrawalService.createBatchWithdrawal(record);
    if (!response.requestSucceeded) {
      snackbar.toastError();
      return;
    }

    const { withdrawal } = response;
    if (photos.length) {
      // upload photos
      await NurseryWithdrawalService.uploadWithdrawalPhotos(withdrawal!.id, photos);
    }

    if (withdrawalCreatedCallback) {
      withdrawalCreatedCallback();
    }

    const hasEmptyBatchesAfterWithdrawal = record.batchWithdrawals.some((batchWithdrawal) => {
      const {
        batchId,
        germinatingQuantityWithdrawn,
        activeGrowthQuantityWithdrawn,
        hardeningOffQuantityWithdrawn,
        readyQuantityWithdrawn,
      } = batchWithdrawal;
      const sourceBatch = batches && batches.find((batch) => Number(batch.id) === Number(batchId));
      return (
        sourceBatch &&
        Number(sourceBatch['germinatingQuantity(raw)']) === Number(germinatingQuantityWithdrawn) &&
        Number(sourceBatch['activeGrowthQuantity(raw)']) === Number(activeGrowthQuantityWithdrawn) &&
        Number(sourceBatch['hardeningOffQuantity(raw)']) === Number(hardeningOffQuantityWithdrawn) &&
        Number(sourceBatch['readyQuantity(raw)']) === Number(readyQuantityWithdrawn)
      );
    });

    if (hasEmptyBatchesAfterWithdrawal) {
      setShowEmptyBatchesModalFor(withdrawal);
    } else {
      onWithdrawSuccess(withdrawal);
    }
  };

  const onWithdrawSuccess = (withdrawal: NurseryWithdrawal | null) => {
    setShowEmptyBatchesModalFor(null);
    if (withdrawal) {
      // set snackbar with status
      snackbar.toastSuccess(getFormattedSuccessMessage(withdrawal));
    }
    // redirect to inventory
    goToInventory();
  };

  const getFormattedSuccessMessage = (withdrawal: NurseryWithdrawal): string => {
    const numBatches = withdrawal.batchWithdrawals?.length;
    const totalWithdrawn = withdrawal.batchWithdrawals?.reduce((total, batchWithdrawal) => {
      const {
        germinatingQuantityWithdrawn,
        activeGrowthQuantityWithdrawn,
        hardeningOffQuantityWithdrawn,
        readyQuantityWithdrawn,
      } = batchWithdrawal;
      if (germinatingQuantityWithdrawn) {
        total += germinatingQuantityWithdrawn;
      }
      if (activeGrowthQuantityWithdrawn) {
        total += activeGrowthQuantityWithdrawn;
      }
      if (hardeningOffQuantityWithdrawn) {
        total += hardeningOffQuantityWithdrawn;
      }
      if (readyQuantityWithdrawn) {
        total += readyQuantityWithdrawn;
      }
      return total;
    }, 0);

    return strings.formatString(
      strings.BATCH_WITHDRAW_SUCCESS,
      numBatches,
      numBatches === 1 ? strings.BATCHES_SINGULAR : (strings.BATCHES_PLURAL as any),
      totalWithdrawn,
      totalWithdrawn === 1 ? strings.SEEDLINGS_SINGULAR : (strings.SEEDLINGS_PLURAL as any)
    ) as string;
  };

  const goToInventory = () => {
    if (sourcePage && sourcePage.startsWith(APP_PATHS.INVENTORY)) {
      navigate({ pathname: sourcePage });
    } else {
      navigate({ pathname: APP_PATHS.INVENTORY });
    }
  };

  if (!batches) {
    return <BusySpinner />;
  }

  return (
    <TfMain>
      <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 'bold', paddingLeft: theme.spacing(3) }}>
        {strings.WITHDRAW_FROM_BATCHES}
      </Typography>

      {flowState === 'purpose' && (
        <SelectPurposeForm
          onNext={onWithdrawalConfigured}
          batches={batches}
          nurseryWithdrawal={record}
          onCancel={goToInventory}
          saveText={strings.NEXT}
          setFilterProjectId={setFilterProjectId}
        />
      )}
      {flowState === 'select batches' && (
        <SelectBatchesWithdrawnQuantity
          onNext={onBatchesSelected}
          onCancel={goToInventory}
          saveText={strings.NEXT}
          batches={batches}
          nurseryWithdrawal={record}
          filterProjectId={filterProjectId}
        />
      )}
      {flowState === 'photos' && <AddPhotos onNext={withdraw} onCancel={goToInventory} saveText={strings.WITHDRAW} />}
      <EmptyBatchesInfoModal
        open={showEmptyBatchesModalFor !== null}
        onClose={() => onWithdrawSuccess(showEmptyBatchesModalFor)}
      />
    </TfMain>
  );
}
