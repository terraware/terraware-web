import React from 'react';

import { Confirm } from '@terraware/web-components';

import strings from 'src/strings';

export type Props = {
  onClose: () => void;
  onConfirm: () => void;
  organizationName: string;
};

const EditNameConfirm = ({ onClose, onConfirm, organizationName }: Props): JSX.Element => {
  return (
    <Confirm
      closeButtonText={strings.CANCEL}
      confirmButtonText={strings.SAVE}
      confirmButtonType='productive'
      message={strings.formatString(strings.EDIT_PROJECT_NAME_CONFIRMATION, organizationName)}
      onClose={onClose}
      onConfirm={onConfirm}
      title={strings.SAVE_PROJECT_NAME}
    />
  );
};

export default EditNameConfirm;
