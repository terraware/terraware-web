import React, { type JSX } from 'react';

import strings from 'src/strings';

import DialogBox from '../common/DialogBox/DialogBox';
import Button from '../common/button/Button';

export interface CannotEditReportDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function CannotEditReportDialog(props: CannotEditReportDialogProps): JSX.Element {
  const { onClose, open, onSubmit } = props;

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.CANNOT_EDIT}
      size='medium'
      middleButtons={[<Button id='gotId' label={strings.GOT_IT} onClick={onSubmit} key='button-1' />]}
      message={strings.INVALID_EDITOR}
      skrim={true}
    />
  );
}
