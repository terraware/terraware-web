import React, { type JSX } from 'react';

import { Typography } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

type ClosePlantingSeasonModalProps = {
  open: boolean;
  seasonName: string;
  onClose: () => void;
  onConfirm: () => void;
  busy?: boolean;
};

const ClosePlantingSeasonModal = ({
  open,
  seasonName,
  onClose,
  onConfirm,
  busy,
}: ClosePlantingSeasonModalProps): JSX.Element => {
  const message = strings.formatString(
    strings.CLOSE_PLANTING_SEASON_CONFIRM,
    <Typography component='span' fontWeight={600} key='season-name'>
      {seasonName}
    </Typography>
  );

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.CLOSE_PLANTING_SEASON}
      size='medium'
      skrim={true}
      middleButtons={[
        <Button
          key='cancel-close-planting-season'
          id='cancelClosePlantingSeason'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          size='medium'
          disabled={busy}
        />,
        <Button
          key='confirm-close-planting-season'
          id='confirmClosePlantingSeason'
          label={strings.CLOSE_SEASON}
          type='destructive'
          onClick={onConfirm}
          size='medium'
          disabled={busy}
        />,
      ]}
    >
      <Typography component='div' fontSize='16px' textAlign='center' sx={{ whiteSpace: 'pre-line' }}>
        {message}
      </Typography>
    </DialogBox>
  );
};

export default ClosePlantingSeasonModal;
