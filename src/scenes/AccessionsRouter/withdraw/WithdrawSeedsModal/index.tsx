import React, { type JSX } from 'react';

import { BusySpinner } from '@terraware/web-components';

import { User } from 'src/types/User';

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
  const { accessions } = useAccessionsByIds(accessionIds);

  if (!open) {
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
