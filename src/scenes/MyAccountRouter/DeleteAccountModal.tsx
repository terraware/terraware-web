import React, { type JSX, useState } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';

import { BusySpinner } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { UserService } from 'src/services';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

export interface DeleteAccountModalProps {
  onCancel: () => void;
}

export default function DeleteAccountModal({ onCancel }: DeleteAccountModalProps): JSX.Element {
  const [busy, setBusy] = useState<boolean>(false);
  const snackbar = useSnackbar();
  const mixpanel = useMixpanel();

  const deleteUser = async () => {
    setBusy(true);
    const response = await UserService.deleteUser();
    if (response.requestSucceeded) {
      mixpanel?.reset();
      window.location.href = '/sso/logout';
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
            onClick={() => void deleteUser()}
            size='medium'
            key='button-2'
          />,
        ]}
        skrim={true}
        message={strings.DELETE_ACCOUNT_CONFIRMATION}
      />
    </>
  );
}
