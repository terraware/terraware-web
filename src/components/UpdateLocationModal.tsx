import React, { type JSX } from 'react';

import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';

export type UpdateLocationModalProps = {
  onClose: () => void;
  onConfirm: () => void;
  locationName: string;
};

const UpdateLocationModal = ({ onClose, onConfirm, locationName }: UpdateLocationModalProps): JSX.Element => (
  <DialogBox
    onClose={onClose}
    open={true}
    title={strings.UPDATE_LOCATION}
    size='medium'
    message={strings.formatString(strings.UPDATE_LOCATION_MESSAGE, locationName)}
    middleButtons={[
      <Button id='no' key='no' label={strings.NO} onClick={onClose} priority='secondary' type='passive' />,
      <Button id='yes' key='yes' label={strings.YES} onClick={onConfirm} type='destructive' />,
    ]}
  />
);

export default UpdateLocationModal;
