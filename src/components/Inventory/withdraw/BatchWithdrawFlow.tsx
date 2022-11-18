import { Box, CircularProgress } from '@mui/material';
import { theme } from '@terraware/web-components';
import React, { useEffect, useState } from 'react';
import { search } from 'src/api/search';
import { NurseryWithdrawal } from 'src/api/types/batch';
import { ServerOrganization } from 'src/types/Organization';
import useForm from 'src/utils/useForm';
import AddPhotos from './flow/AddPhotos';
import SelectBatches from './flow/SelectBatches';
import SelectPurposeForm from './flow/SelectPurposeForm';

type FlowStates = 'purpose' | 'select batches' | 'photos';

type BatchWithdrawFlowProps = {
  organization: ServerOrganization;
  batchIds: string[];
};

export default function BatchWithdrawFlow(props: BatchWithdrawFlowProps): JSX.Element {
  const { organization, batchIds } = props;
  const [flowState, setFlowState] = useState<FlowStates>('purpose');
  const [records, setRecords] = useForm<NurseryWithdrawal[]>([]);
  const [batches, setBatches] = useState<any[]>();

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

  const onPurposeSelected = () => {
    if (batchIds.length === 1) {
      setFlowState('photos');
    } else {
      setFlowState('select batches');
    }
  };

  const onBatchesSelected = () => {
    setFlowState('photos');
  };

  if (!batches) {
    return (
      <Box display='flex' justifyContent='center' padding={theme.spacing(5)}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {flowState === 'purpose' && (
        <SelectPurposeForm
          onNext={onPurposeSelected}
          organization={organization}
          batches={batches}
          records={records}
          setRecords={setRecords}
        />
      )}
      {flowState === 'select batches' && <SelectBatches onNext={onBatchesSelected} organization={organization} />}
      {flowState === 'photos' && <AddPhotos onNext={onPurposeSelected} organization={organization} />}
    </>
  );
}
