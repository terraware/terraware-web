import React, { type JSX, useState } from 'react';

import { Box } from '@mui/material';
import { Checkbox } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { PlantingSitePayload, useUpdatePlantingSiteSpeciesTargetMutation } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

export type PlantingPlanAssignStrataModalProps = {
  plantingSite: PlantingSitePayload;
  speciesId: number;
  targetPlants?: number;
  initialStratumIds: number[];
  onClose: () => void;
};

const PlantingPlanAssignStrataModal = ({
  plantingSite,
  speciesId,
  targetPlants,
  initialStratumIds,
  onClose,
}: PlantingPlanAssignStrataModalProps): JSX.Element => {
  const snackbar = useSnackbar();
  const [updateSpeciesTarget, { isLoading }] = useUpdatePlantingSiteSpeciesTargetMutation();
  const [selected, setSelected] = useState<Set<number>>(new Set(initialStratumIds));

  const strata = plantingSite.strata ?? [];

  const toggle = (stratumId: number, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(stratumId);
      } else {
        next.delete(stratumId);
      }
      return next;
    });
  };

  const onAssign = async () => {
    try {
      await updateSpeciesTarget({
        plantingSiteId: plantingSite.id,
        speciesId,
        updatePlantingSiteSpeciesTargetRequestPayload: {
          stratumIds: Array.from(selected),
          targetPlants,
        },
      }).unwrap();
      onClose();
    } catch (e) {
      snackbar.toastError();
    }
  };

  return (
    <DialogBox
      onClose={onClose}
      open
      title={strings.ASSIGN_STRATA}
      size='medium'
      middleButtons={[
        <Button
          key='cancel'
          id='cancelAssignStrata'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
        />,
        <Button
          key='assign'
          id='assignStrata'
          label={strings.ASSIGN_STRATA}
          onClick={() => void onAssign()}
          disabled={isLoading}
        />,
      ]}
      skrim
    >
      <Box display='flex' flexDirection='column' gap={1}>
        {strata.map((stratum) => (
          <Checkbox
            key={stratum.id}
            id={`stratum-${stratum.id}`}
            name={`stratum-${stratum.id}`}
            label={stratum.name}
            value={selected.has(stratum.id)}
            onChange={(checked) => toggle(stratum.id, checked)}
          />
        ))}
      </Box>
    </DialogBox>
  );
};

export default PlantingPlanAssignStrataModal;
