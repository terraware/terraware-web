import React, { type JSX } from 'react';

import { Typography } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

type DeletePlantingSeasonModalProps = {
  open: boolean;
  seasonName: string;
  onClose: () => void;
  onConfirm: () => void;
  busy?: boolean;
};

const DeletePlantingSeasonModal = ({
  open,
  seasonName,
  onClose,
  onConfirm,
  busy,
}: DeletePlantingSeasonModalProps): JSX.Element => {
  const message = strings.formatString(
    strings.DELETE_PLANTING_SEASON_CONFIRM,
    <Typography component='span' fontWeight={600} key='season-name'>
      {seasonName}
    </Typography>
  );

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.DELETE_PLANTING_SEASON}
      size='medium'
      skrim={true}
      middleButtons={[
        <Button
          key='cancel-delete-planting-season'
          id='cancelDeletePlantingSeason'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          size='medium'
          disabled={busy}
        />,
        <Button
          key='confirm-delete-planting-season'
          id='confirmDeletePlantingSeason'
          label={strings.DELETE_SEASON}
          type='destructive'
          onClick={onConfirm}
          size='medium'
          disabled={busy}
        />,
      ]}
    >
      <Typography component='div' fontSize='16px' textAlign='center'>
        {message}
      </Typography>
      <Typography component='div' fontSize='16px' textAlign='center' marginTop={2}>
        {strings.ARE_YOU_SURE_DELETE}
      </Typography>
    </DialogBox>
  );
};

export default DeletePlantingSeasonModal;
