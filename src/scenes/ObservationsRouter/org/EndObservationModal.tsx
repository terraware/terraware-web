import React, { type JSX } from 'react';

import { Typography, useTheme } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { getShortDate } from 'src/utils/dateFormatter';

export interface EndObservationModalProps {
  onClose: () => void;
  onSave: () => void;
  observation: any;
}

export default function EndObservationModal(props: EndObservationModalProps): JSX.Element {
  const { onClose, onSave, observation } = props;
  const { selectedLocale } = useLocalization();

  const theme = useTheme();

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.END_OBSERVATION}
      size='medium'
      message={strings.END_OBSERVATION_MODAL_MESSAGE}
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button id='save' onClick={onSave} label={strings.END_OBSERVATION} key='button-2' />,
      ]}
      scrolled
    >
      <Typography marginTop={3} color={theme.palette.TwClrTxt}>
        {strings.formatString(
          strings.END_OBSERVATION_MODAL_QUESTION,
          getShortDate(observation.observationDate, selectedLocale)
        )}
      </Typography>
    </DialogBox>
  );
}
