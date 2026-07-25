import React, { useCallback, useState } from 'react';

import _ from 'lodash';

import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { useSaveBatch } from 'src/hooks/batches/useSaveBatch';
import { useOrganization } from 'src/providers';
import SubLocationsDropdown from 'src/scenes/InventoryRouter/form/SubLocationsDropdown';
import { useSubLocations } from 'src/scenes/InventoryRouter/form/useSubLocations';
import strings from 'src/strings';
import { Batch } from 'src/types/Batch';
import useSnackbar from 'src/utils/useSnackbar';

interface OverviewItemCardSubLocationsProps {
  batch: Batch;
}

const OverviewItemCardSubLocations = (props: OverviewItemCardSubLocationsProps) => {
  const snackbar = useSnackbar();
  const saveBatch = useSaveBatch();
  const { selectedOrganization } = useOrganization();

  const [batch, setBatch] = useState<Batch>(props.batch);

  const { availableSubLocations, selectedSubLocations } = useSubLocations(batch.facilityId, batch);

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
      if (_.isEqual(props.batch.subLocationIds, _batch.subLocationIds) || !selectedOrganization) {
        return;
      }

      const save = async () => {
        // The batch cache is invalidated by the update, so other consumers pick up the change
        const savedBatch = await saveBatch({ batch: _batch, organizationId: selectedOrganization.id });
        if (savedBatch) {
          setBatch(savedBatch);
        } else {
          snackbar.toastError(strings.GENERIC_ERROR);
        }
      };

      void save();
    },
    [props.batch.subLocationIds, saveBatch, selectedOrganization, snackbar]
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
