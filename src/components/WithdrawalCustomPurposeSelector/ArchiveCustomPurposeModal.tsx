import React, { type JSX } from 'react';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import { WithdrawalCustomPurposePayload } from 'src/queries/generated/withdrawalCustomPurposes';

type ArchiveCustomPurposeModalProps = {
  customPurpose: WithdrawalCustomPurposePayload;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ArchiveCustomPurposeModal = ({
  customPurpose,
  busy,
  onClose,
  onConfirm,
}: ArchiveCustomPurposeModalProps): JSX.Element => {
  const { strings } = useLocalization();

  return (
    <DialogBox
      onClose={onClose}
      open
      title={strings.formatString(strings.ARCHIVE_X, customPurpose.name) as string}
      size='medium'
      middleButtons={[
        <Button
          id='cancelArchiveCustomPurpose'
          key='button-1'
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          size='medium'
          type='passive'
        />,
        <Button
          disabled={busy}
          id='archiveCustomPurpose'
          key='button-2'
          label={strings.ARCHIVE}
          onClick={onConfirm}
          size='medium'
          type='destructive'
        />,
      ]}
      message={[
        strings.formatString(strings.ARCHIVE_CUSTOM_PURPOSE_MESSAGE, customPurpose.name) as string,
        strings.ARE_YOU_SURE,
      ]}
      skrim
    />
  );
};

export default ArchiveCustomPurposeModal;
