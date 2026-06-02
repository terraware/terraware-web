import React, { type JSX } from 'react';

import { Typography } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

type DeleteSpeciesGoalModalProps = {
  open: boolean;
  speciesName: string;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteSpeciesGoalModal = ({
  open,
  speciesName,
  onClose,
  onConfirm,
}: DeleteSpeciesGoalModalProps): JSX.Element => {
  const message = strings.formatString(
    strings.DELETE_SPECIES_GOAL_CONFIRM,
    <Typography component='span' fontWeight={600} key='species-name'>
      {speciesName}
    </Typography>
  );

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.DELETE_SPECIES_GOAL}
      size='medium'
      skrim={true}
      middleButtons={[
        <Button
          key='cancel-delete-species-goal'
          id='cancelDeleteSpeciesGoal'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          size='medium'
        />,
        <Button
          key='confirm-delete-species-goal'
          id='confirmDeleteSpeciesGoal'
          label={strings.DELETE}
          type='destructive'
          onClick={onConfirm}
          size='medium'
        />,
      ]}
    >
      <Typography component='div' fontSize='16px' textAlign='center'>
        {message}
      </Typography>
    </DialogBox>
  );
};

export default DeleteSpeciesGoalModal;
