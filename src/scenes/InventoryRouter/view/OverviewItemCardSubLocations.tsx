import React, { useCallback, useEffect, useState } from 'react';

import _ from 'lodash';

import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { useOrganization } from 'src/providers';
import { requestFetchBatch, requestSaveBatch } from 'src/redux/features/batches/batchesAsyncThunks';
import { selectBatchesRequest } from 'src/redux/features/batches/batchesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import SubLocationsDropdown from 'src/scenes/InventoryRouter/form/SubLocationsDropdown';
import { useSubLocations } from 'src/scenes/InventoryRouter/form/useSubLocations';
import { BatchData } from 'src/services/NurseryBatchService';
import strings from 'src/strings';
import { Batch } from 'src/types/Batch';
import useSnackbar from 'src/utils/useSnackbar';

interface OverviewItemCardSubLocationsProps {
  batch: Batch;
}

const OverviewItemCardSubLocations = (props: OverviewItemCardSubLocationsProps) => {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { selectedOrganization } = useOrganization();

  const [batch, setBatch] = useState<Batch>(props.batch);

  const { availableSubLocations, selectedSubLocations } = useSubLocations(batch.facilityId, batch);

  const [requestId, setRequestId] = useState('');
  const batchesRequest = useAppSelector(selectBatchesRequest(requestId));

  const [showSubLocationEdit, setShowSubLocationEdit] = useState<boolean>(false);

  const handleUpdateSubLocations = useCallback(
    (setFn: (previousBatch: Batch) => Batch) => {
      const nextBatch = setFn(batch);
      setBatch(nextBatch);
    },
    [batch]
  );

  const syncSubLocations = useCallback(
    (_batch: Batch) => {
      if (!_.isEqual(props.batch.subLocationIds, _batch.subLocationIds)) {
        const request = dispatch(requestSaveBatch({ batch: _batch, organizationId: selectedOrganization.id }));
        setRequestId(request.requestId);
      }
    },
    [dispatch, props.batch.subLocationIds, selectedOrganization.id]
  );

  const toggleSubLocationEdit = useCallback(() => {
    const nextShowSubLocationEdit = !showSubLocationEdit;

    // If we're "turning off" the edit mode, and the sub locations aren't the same, we need to update the batch
    if (!nextShowSubLocationEdit) {
      syncSubLocations(batch);
    }

    setShowSubLocationEdit(nextShowSubLocationEdit);
  }, [batch, showSubLocationEdit, syncSubLocations]);

  const handleOnBlur = useCallback(
    (_batch: Batch) => {
      syncSubLocations(_batch);
      setShowSubLocationEdit(false);
    },
    [syncSubLocations]
  );

  useEffect(() => {
    if (batchesRequest?.status === 'success' && batchesRequest.data) {
      const nextBatch = (batchesRequest.data as BatchData).batch;
      if (nextBatch) {
        setBatch(nextBatch);
      }
      // Since we've updated the batch, we want to make sure any consumers are updated
      dispatch(requestFetchBatch({ batchId: batch.id }));
    } else if (batchesRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [batch.id, batchesRequest, dispatch, snackbar]);

  return (
    <OverviewItemCard
      title={strings.SUB_LOCATION}
      contents={
        showSubLocationEdit ? (
          <SubLocationsDropdown<Batch>
            availableSubLocations={availableSubLocations}
            minimal
            onBlur={handleOnBlur}
            record={batch}
            setRecord={handleUpdateSubLocations}
          />
        ) : (
          (selectedSubLocations || []).map((subLocation) => subLocation.name).join(', ')
        )
      }
      isEditable
      handleEdit={toggleSubLocationEdit}
    />
  );
};

export default OverviewItemCardSubLocations;
