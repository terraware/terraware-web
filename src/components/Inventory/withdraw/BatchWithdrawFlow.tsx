import { Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { BusySpinner, theme } from '@terraware/web-components';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { NurseryWithdrawalRequest, NurseryWithdrawal, NurseryWithdrawalPurposes } from 'src/types/Batch';
import { isContributor } from 'src/utils/organization';
import { NurseryBatchService, NurseryWithdrawalService } from 'src/services';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';
import useSnackbar from 'src/utils/useSnackbar';
import useForm from 'src/utils/useForm';
import AddPhotos from './flow/AddPhotos';
import SelectBatchesWithdrawnQuantity from './flow/SelectBatchesWithdrawnQuantity';
import SelectPurposeForm from './flow/SelectPurposeForm';
import TfMain from 'src/components/common/TfMain';
import { useOrganization } from 'src/providers/hooks';

type FlowStates = 'purpose' | 'select batches' | 'photos';

type BatchWithdrawFlowProps = {
  batchIds: string[];
  sourcePage?: string;
  withdrawalCreatedCallback?: () => void;
};

export default function BatchWithdrawFlow(props: BatchWithdrawFlowProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { batchIds, sourcePage, withdrawalCreatedCallback } = props;
  const { OUTPLANT, NURSERY_TRANSFER } = NurseryWithdrawalPurposes;
  const [flowState, setFlowState] = useState<FlowStates>('purpose');
  const [record, setRecord] = useForm<NurseryWithdrawalRequest>({
    batchWithdrawals: [],
    facilityId: -1,
    purpose: isContributor(selectedOrganization) ? NURSERY_TRANSFER : OUTPLANT,
    withdrawnDate: getTodaysDateFormatted(),
  });
  const [batches, setBatches] = useState<any[]>();
  const snackbar = useSnackbar();
  const history = useHistory();

  useEffect(() => {
    const populateBatches = async () => {
      const searchResponse = await NurseryBatchService.getBatches(
        selectedOrganization.id,
        batchIds.map((id) => Number(id))
      );

      if (searchResponse) {
        const withdrawable = searchResponse.filter((batch: any) => +batch['totalQuantity(raw)'] > 0);
        if (!withdrawable.length) {
          snackbar.toastError(strings.NO_BATCHES_TO_WITHDRAW_FROM); // temporary until we have a solution from design
        }
        setBatches(withdrawable);
      }
    };
    populateBatches();
  }, [batchIds, snackbar, selectedOrganization.id]);

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
        const { readyQuantityWithdrawn, notReadyQuantityWithdrawn } = batchWithdrawal;

        return {
          ...batchWithdrawal,
          readyQuantityWithdrawn: isNaN(readyQuantityWithdrawn) ? 0 : readyQuantityWithdrawn,
          notReadyQuantityWithdrawn: isNaN(notReadyQuantityWithdrawn) ? 0 : notReadyQuantityWithdrawn,
        };
      })
      .filter((batchWithdrawal) => {
        return batchWithdrawal.readyQuantityWithdrawn + batchWithdrawal.notReadyQuantityWithdrawn > 0;
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
    // set snackbar with status
    snackbar.toastSuccess(getFormattedSuccessMessage(withdrawal as NurseryWithdrawal));
    // redirect to inventory
    goToInventory();
  };

  const getFormattedSuccessMessage = (withdrawal: NurseryWithdrawal): string => {
    const numBatches = withdrawal.batchWithdrawals?.length;
    const totalWithdrawn = withdrawal.batchWithdrawals?.reduce((total, batchWithdrawal) => {
      const { germinatingQuantityWithdrawn, notReadyQuantityWithdrawn, readyQuantityWithdrawn } = batchWithdrawal;
      if (germinatingQuantityWithdrawn) {
        total += germinatingQuantityWithdrawn;
      }
      if (notReadyQuantityWithdrawn) {
        total += notReadyQuantityWithdrawn;
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
      history.push({ pathname: sourcePage });
    } else {
      history.push({ pathname: APP_PATHS.INVENTORY });
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
        />
      )}
      {flowState === 'select batches' && (
        <SelectBatchesWithdrawnQuantity
          onNext={onBatchesSelected}
          onCancel={goToInventory}
          saveText={strings.NEXT}
          batches={batches}
          nurseryWithdrawal={record}
        />
      )}
      {flowState === 'photos' && <AddPhotos onNext={withdraw} onCancel={goToInventory} saveText={strings.WITHDRAW} />}
    </TfMain>
  );
}
