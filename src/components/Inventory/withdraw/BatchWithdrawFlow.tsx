import { Box, CircularProgress, Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { theme } from '@terraware/web-components';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { search } from 'src/api/search';
import { NurseryWithdrawalRequest } from 'src/api/types/batch';
import { ServerOrganization } from 'src/types/Organization';
import { isContributor } from 'src/utils/organization';
import { createBatchWithdrawal, uploadWithdrawalPhoto } from 'src/api/batch/batch';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';
import useSnackbar from 'src/utils/useSnackbar';
import useForm from 'src/utils/useForm';
import AddPhotos from './flow/AddPhotos';
import SelectBatchesWithdrawnQuantity from './flow/SelectBatchesWithdrawnQuantity';
import SelectPurposeForm from './flow/SelectPurposeForm';
import TfMain from 'src/components/common/TfMain';

type FlowStates = 'purpose' | 'select batches' | 'photos';

type BatchWithdrawFlowProps = {
  organization: ServerOrganization;
  batchIds: string[];
};

export default function BatchWithdrawFlow(props: BatchWithdrawFlowProps): JSX.Element {
  const { organization, batchIds } = props;
  const [flowState, setFlowState] = useState<FlowStates>('purpose');
  const [record, setRecord] = useForm<NurseryWithdrawalRequest>({
    batchWithdrawals: [],
    facilityId: -1,
    purpose: isContributor(organization) ? 'Nursery Transfer' : 'Out Plant',
    withdrawnDate: getTodaysDateFormatted(),
  });
  const [batches, setBatches] = useState<any[]>();
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
        ],
        count: 1000,
      });

      if (searchResponse) {
        setBatches(searchResponse);
      }
    };
    populateBatches();
  }, [batchIds]);

  const onWithdrawalConfigured = (withdrawal: NurseryWithdrawalRequest) => {
    setRecord(withdrawal);
    if (batchIds.length === 1) {
      setFlowState('photos');
    } else {
      setFlowState('select batches');
    }
  };

  const onBatchesSelected = () => {
    setFlowState('photos');
  };

  const withdraw = async (photos: File[]) => {
    // first create the withdrawal
    const response = await createBatchWithdrawal(record);
    if (!response.requestSucceeded) {
      snackbar.toastError(response.error);
      return;
    }

    const { withdrawalId } = response;
    if (withdrawalId && photos.length) {
      // upload photos
      const uploadPhotoPromises = photos.map((photo) => uploadWithdrawalPhoto(withdrawalId, photo));
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

    // set snackbar with status
    snackbar.toastSuccess(strings.SAVE_CHANGES); // TODO set status as per design
    // redirect to inventory
    goToInventory();
  };

  const goToInventory = () => {
    const pathname = APP_PATHS.INVENTORY;

    history.push({ pathname });
  };

  if (!batches) {
    return (
      <Box display='flex' justifyContent='center' padding={theme.spacing(5)}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TfMain>
      <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 'bold' }}>
        {strings.WITHDRAW_FROM_BATCHES}
      </Typography>

      {flowState === 'purpose' && (
        <SelectPurposeForm
          onNext={onWithdrawalConfigured}
          organization={organization}
          batches={batches}
          nurseryWithdrawal={record}
          onCancel={goToInventory}
          saveText={strings.NEXT}
        />
      )}
      {flowState === 'select batches' && (
        <SelectBatchesWithdrawnQuantity
          onNext={onBatchesSelected}
          organization={organization}
          onCancel={goToInventory}
          saveText={strings.NEXT}
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
