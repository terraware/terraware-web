import React, { type JSX } from 'react';

import strings from 'src/strings';

import DialogBox from '../../components/common/DialogBox/DialogBox';
import Button from '../../components/common/button/Button';

export interface ChangeTabWarningModalProps {
  onClose: () => void;
  onExit: () => void;
  type?: string;
}

export default function ChangeTabWarningModal(props: ChangeTabWarningModalProps): JSX.Element {
  const { onExit, onClose, type } = props;

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={type === 'temporary' ? strings.EXITING_TEMPORARY_PLOTS : strings.EXITING_PERMANENT_PLOTS}
      size='medium'
      middleButtons={[
        <Button
          id='continue'
          label={strings.EXIT}
          type='destructive'
          onClick={onExit}
          priority='secondary'
          key='button-1'
        />,
        <Button id='close' onClick={onClose} label={strings.CANCEL} key='button-2' type='productive' />,
      ]}
      skrim={true}
      message={
        type === 'temporary'
          ? strings.LEAVING_SURVIVAL_RATE_EDIT_SCREEN_TEMPORARY_PLOTS
          : strings.LEAVING_SURVIVAL_RATE_EDIT_SCREEN_PERMANENT_PLOTS
      }
    />
  );
}
