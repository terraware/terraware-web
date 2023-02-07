import { Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { theme } from '@terraware/web-components';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { search } from 'src/api/search';
import { NurseryWithdrawalRequest, NurseryWithdrawal, NurseryWithdrawalPurposes } from 'src/types/Batch';
import { isContributor } from 'src/utils/organization';
import { NurseryBatchService } from 'src/services';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';
import useSnackbar from 'src/utils/useSnackbar';
import useForm from 'src/utils/useForm';
import AddPhotos from './flow/AddPhotos';
import SelectBatchesWithdrawnQuantity from './flow/SelectBatchesWithdrawnQuantity';
import SelectPurposeForm from './flow/SelectPurposeForm';
import TfMain from 'src/components/common/TfMain';
import BusySpinner from 'src/components/common/BusySpinner';
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
  const [withdrawInProgress, setWithdrawInProgress] = useState<boolean>(false);
  const snackbar = useSnackbar();
  const history = useHistory();

  useEffect(() => {
    const populateBatches = async () => {
      const searchResponse = await search({
        prefix: 'batches',
        search: {
          operation: 'and',
          children: [
            {
              operation: 'field',
              field: 'id',
              values: batchIds,
            },
          ],
        },
        fields: [
          'id',
          'batchNumber',
          'germinatingQuantity',
          'notReadyQuantity',
          'readyQuantity',
          'totalQuantity',
          'totalQuantityWithdrawn',
          'facility_id',
          'facility_name',
          'readyByDate',
          'addedDate',
          'version',
          'accession_id',
          'accession_accessionNumber',
          'notes',
          'species_id',
          'species_scientificName',
          'species_commonName',
        ],
        count: 1000,
      });

      if (searchResponse) {
        const withdrawable = searchResponse.filter((batch) => Number(batch.totalQuantity) > 0);
        if (!withdrawable.length) {
          snackbar.toastError(strings.NO_BATCHES_TO_WITHDRAW_FROM); // temporary until we have a solution from design
        }
        setBatches(withdrawable);
      }
    };
    populateBatches();
  }, [batchIds, snackbar]);

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
    if (withdrawInProgress) {
      return;
    }

    // first create the withdrawal
    record.batchWithdrawals = record.batchWithdrawals.filter((batchWithdrawal) => {
      return Number(batchWithdrawal.readyQuantityWithdrawn) + Number(batchWithdrawal.notReadyQuantityWithdrawn) > 0;
    });

    if (record.batchWithdrawals.length === 0) {
      snackbar.toastError(strings.NO_BATCHES_TO_WITHDRAW_FROM); // temporary until we have a solution from design
      return;
    }

    setWithdrawInProgress(true);

    const response = await NurseryBatchService.createBatchWithdrawal(record);
    if (!response.requestSucceeded) {
      snackbar.toastError(response.error);
      setWithdrawInProgress(false);
      return;
    }

    const { withdrawal } = response;
    if (photos.length) {
      // upload photos
      const uploadPhotoPromises = photos.map((photo) =>
        NurseryBatchService.uploadWithdrawalPhoto(withdrawal!.id, photo)
      );
      try {
        const promiseResponses = await Promise.allSettled(uploadPhotoPromises);
        promiseResponses.forEach((promiseResponse) => {
          if (promiseResponse.status === 'rejected') {
            // tslint:disable-next-line: no-console
            console.error(promiseResponse.reason);
          }
        });
      } catch (e) {
        // swallow error
      }
    }

    setWithdrawInProgress(false);
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
      {withdrawInProgress && <BusySpinner withSkrim={true} />}
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
      {flowState === 'photos' && (
        <AddPhotos
          onNext={withdraw}
          withdrawalPurpose={record.purpose}
          onCancel={goToInventory}
          saveText={strings.WITHDRAW}
        />
      )}
    </TfMain>
  );
}
