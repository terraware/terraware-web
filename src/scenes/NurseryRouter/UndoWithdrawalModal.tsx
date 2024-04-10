import React from 'react';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

export interface UndoWithdrawalModalProps {
  onClose: () => void;
  row: any;
}

export default function UndoWithdrawalModal(props: UndoWithdrawalModalProps): JSX.Element {
  const { onClose } = props;
  const snackbar = useSnackbar();

  const onSubmit = () => {
    // TODO backend
    // const response = await NurseryWithdrawalService.undoNurseryWithdrawal();
    // if (response.requestSucceeded) {
    snackbar.toastSuccess(strings.WITHDRAWAL_UNDONE_DESCRIPTION, strings.WITHDRAWAL_UNDONE);
    onClose();
    // } else {
    //   snackbar.toastError();
    // }
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
        <Button id='undoWithdrawal' label={strings.UNDO_WITHDRAWAL} onClick={onSubmit} key='button-2' />,
      ]}
      message={strings.UNDO_WITHDRAWAL_CONFIRMATION}
      skrim={true}
    />
  );
}
