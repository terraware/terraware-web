import React, { type JSX, useEffect } from 'react';

import { BusySpinner } from '@terraware/web-components';

import { User } from 'src/types/User';
import useSnackbar from 'src/utils/useSnackbar';

import WithdrawSeedsForm from './WithdrawSeedsForm';
import useAccessionsByIds from './useAccessionsByIds';

export type WithdrawSeedsModalProps = {
  open: boolean;
  onClose: () => void;
  accessionIds: number[];
  user: User;
  onWithdrawn?: () => void;
};

const WithdrawSeedsModal = ({
  open,
  onClose,
  accessionIds,
  user,
  onWithdrawn,
}: WithdrawSeedsModalProps): JSX.Element => {
  const { accessions, isError } = useAccessionsByIds(accessionIds);
  const snackbar = useSnackbar();

  // If the accessions could not be loaded, close the modal (the parent owns `open`) and surface
  // the failure, so the user is not left staring at an empty, unclosable dialog.
  useEffect(() => {
    if (open && isError) {
      snackbar.toastError();
      onClose();
    }
  }, [isError, onClose, open, snackbar]);

  if (!open || isError) {
    return <></>;
  }

  if (!accessions) {
    return <BusySpinner withSkrim />;
  }

  if (accessions.length === 0) {
    return <></>;
  }

  return (
    <WithdrawSeedsForm open={open} onClose={onClose} accessions={accessions} user={user} onWithdrawn={onWithdrawn} />
  );
};

export default WithdrawSeedsModal;
