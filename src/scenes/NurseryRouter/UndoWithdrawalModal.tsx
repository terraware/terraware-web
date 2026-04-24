import React, { type JSX } from 'react';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useUndoBatchWithdrawalMutation } from 'src/queries/generated/nurseryWithdrawals';
import { SearchNurseryWithdrawalPayload } from 'src/queries/search/nurseries';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

export interface UndoWithdrawalModalProps {
  onClose: () => void;
  row: SearchNurseryWithdrawalPayload;
}

export default function UndoWithdrawalModal(props: UndoWithdrawalModalProps): JSX.Element {
  const { onClose, row } = props;
  const snackbar = useSnackbar();
  const [undoWithdrawal, { isLoading }] = useUndoBatchWithdrawalMutation();

  const onSubmit = async () => {
    try {
      await undoWithdrawal(row.withdrawalId).unwrap();
      snackbar.toastSuccess(strings.WITHDRAWAL_UNDONE_DESCRIPTION, strings.WITHDRAWAL_UNDONE);
    } catch (e) {
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
          disabled={isLoading}
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
