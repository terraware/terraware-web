import { Box, CircularProgress, Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { theme } from '@terraware/web-components';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { search } from 'src/api/search';
import { NurseryWithdrawal } from 'src/api/types/batch';
import { ServerOrganization } from 'src/types/Organization';
import { isContributor } from 'src/utils/organization';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';
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
  const [record, setRecord] = useForm<NurseryWithdrawal>({
    id: -1,
    batchWithdrawals: [],
    facilityId: -1,
    purpose: isContributor(organization) ? 'Nursery Transfer' : 'Out Plant',
    withdrawnDate: getTodaysDateFormatted(),
  });
  const [batches, setBatches] = useState<any[]>();
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

  const onWithdrawalConfigured = (withdrawal: NurseryWithdrawal) => {
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

  const onPhotosSelected = (file: File[]) => {
    // post withdrawal here
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
          onNext={onPhotosSelected}
          withdrawalPurpose={record.purpose}
          onCancel={goToInventory}
          saveText={strings.WITHDRAW}
        />
      )}
    </TfMain>
  );
}
