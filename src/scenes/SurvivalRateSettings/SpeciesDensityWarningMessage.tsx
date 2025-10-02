import React from 'react';

import strings from 'src/strings';

import DialogBox from '../../components/common/DialogBox/DialogBox';
import Button from '../../components/common/button/Button';

export interface SpeciesDensityWarningMessageProps {
  onClose: () => void;
  onSave: () => void;
}

export default function SpeciesDensityWarningMessage(props: SpeciesDensityWarningMessageProps): JSX.Element {
  const { onClose, onSave } = props;

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.SAVE_PLANT_DENSITY}
      size='medium'
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button id='save' onClick={onSave} label={strings.SAVE} key='button-2' type='productive' />,
      ]}
      skrim={true}
      message={strings.SPECIES_DENSITY_WARNING_MESSAGE}
    >
      <p>{strings.WOULD_YOU_LIKE_TO_CONTINUE}</p>
    </DialogBox>
  );
}
