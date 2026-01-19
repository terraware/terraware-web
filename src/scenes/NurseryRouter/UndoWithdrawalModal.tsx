import React, { type JSX, useState } from 'react';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { NurseryWithdrawalService } from 'src/services';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

export interface UndoWithdrawalModalProps {
  onClose: () => void;
  row: any;
  reload?: () => void;
}

export default function UndoWithdrawalModal(props: UndoWithdrawalModalProps): JSX.Element {
  const { onClose, row, reload } = props;
  const snackbar = useSnackbar();
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setBusy(true);
    const response = await NurseryWithdrawalService.undoNurseryWithdrawal(row.id);
    setBusy(false);
    if (response.requestSucceeded) {
      if (reload) {
        reload();
      }
      snackbar.toastSuccess(strings.WITHDRAWAL_UNDONE_DESCRIPTION, strings.WITHDRAWAL_UNDONE);
      onClose();
    } else {
      snackbar.toastError();
    }
  };

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.UNDO_WITHDRAWAL}
      size='medium'
      middleButtons={[
        <Button
          id='cancelUndoWithdrawal'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          key='button-1'
        />,
        <Button
          disabled={busy}
          id='undoWithdrawal'
          label={strings.UNDO_WITHDRAWAL}
          onClick={() => void onSubmit()}
          key='button-2'
        />,
      ]}
      message={strings.UNDO_WITHDRAWAL_CONFIRMATION}
      skrim={true}
    />
  );
}
