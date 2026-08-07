import React, { type JSX } from 'react';

import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';

export type CancelSpeciesCheckModalProps = {
  onClose: () => void;
  onConfirm: () => void;
};

const CancelSpeciesCheckModal = ({ onClose, onConfirm }: CancelSpeciesCheckModalProps): JSX.Element => (
  <DialogBox
    onClose={onClose}
    open={true}
    title={strings.CANCEL_SPECIES_CHECK}
    size='medium'
    message={strings.CANCEL_SPECIES_CHECK_MESSAGE}
    middleButtons={[
      <Button id='no' key='no' label={strings.NO} onClick={onClose} priority='secondary' type='passive' />,
      <Button id='yes' key='yes' label={strings.YES} onClick={onConfirm} type='destructive' />,
    ]}
  />
);

export default CancelSpeciesCheckModal;
