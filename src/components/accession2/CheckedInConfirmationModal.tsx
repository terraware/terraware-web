import React from 'react';
import strings from 'src/strings';
import Button from '../common/button/Button';
import DialogBox from '../common/DialogBox/DialogBox';
import { Accession2 } from 'src/api/accessions2/accession';

export interface CheckedInConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  accession: Accession2;
}

export default function CheckedInConfirmationModal(props: CheckedInConfirmationModalProps): JSX.Element {
  const { onClose, open, accession } = props;

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.ACCESSION_CHECKED_IN}
      size='medium'
      middleButtons={[<Button onClick={onClose} type='passive' label={strings.CLOSE} key='button-1' />]}
      message={strings.formatString(strings.ACCESSION_NUMBER_CHECKED_IN, accession.accessionNumber.toString())}
    />
  );
}
