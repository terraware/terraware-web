import React from 'react';

import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';

type EditQualitativeDataConfirmationModalProps = {
  onClose: () => void;
  onSubmit: () => void;
};

const EditQualitativeDataConfirmationModal = ({ onClose, onSubmit }: EditQualitativeDataConfirmationModalProps) => {
  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.SAVE_OBSERVATION_DATA}
      size='medium'
      middleButtons={[
        <Button
          id='cancelSaving'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          size='medium'
          key='button-1'
        />,
        <Button
          id='confirmSaving'
          label={strings.CONTINUE}
          type='destructive'
          onClick={onSubmit}
          size='medium'
          key='button-2'
        />,
      ]}
      skrim={true}
      message={strings.SAVE_OBSERVATION_DATA_DESCRIPTION}
    />
  );
};

export default EditQualitativeDataConfirmationModal;
