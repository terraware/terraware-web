import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { BusySpinner } from '@terraware/web-components';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { UserService } from 'src/services';
import useSnackbar from 'src/utils/useSnackbar';

const useStyles = makeStyles(() => ({
  mainContent: {
    color: '#3A4445',
    fontSize: '16px',
  },
}));

export interface DeleteAccountModalProps {
  onCancel: () => void;
}

export default function DeleteAccountModal({ onCancel }: DeleteAccountModalProps): JSX.Element {
  const [busy, setBusy] = useState<boolean>(false);
  const classes = useStyles();
  const snackbar = useSnackbar();

  const deleteUser = async () => {
    setBusy(true);
    const response = await UserService.deleteUser();
    if (response.requestSucceeded) {
      window.location.href = `/sso/logout`;
    } else {
      setBusy(false);
      snackbar.toastError(strings.DELETE_ACCOUNT_ERROR);
    }
  };

  return (
    <>
      {busy && <BusySpinner withSkrim={true} />}
      <DialogBox
        onClose={onCancel}
        open={true}
        title={strings.DELETE_ACCOUNT}
        size='medium'
        middleButtons={[
          <Button
            id='cancelDeleteAccount'
            label={strings.CANCEL}
            priority='secondary'
            type='passive'
            onClick={onCancel}
            size='medium'
            key='button-1'
          />,
          <Button
            id='saveDeleteAccount'
            label={strings.DELETE_ACCOUNT}
            icon='iconTrashCan'
            type='destructive'
            onClick={deleteUser}
            size='medium'
            key='button-2'
          />,
        ]}
        skrim={true}
      >
        <p className={classes.mainContent}>{strings.DELETE_ACCOUNT_CONFIRMATION}</p>
      </DialogBox>
    </>
  );
}
