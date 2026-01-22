import React, { type JSX } from 'react';

import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';

export interface RemoveProjectsDialogProps {
  onClose: (reload?: boolean) => void;
  onSubmit: (ids: number[]) => void;
  ppSpeciesToRemove: number[];
}

export default function RemoveProjectsDialog(props: RemoveProjectsDialogProps): JSX.Element | null {
  const { onClose, ppSpeciesToRemove, onSubmit } = props;

  const removePpSpecies = () => {
    onSubmit(ppSpeciesToRemove);
    onClose();
  };

  return (
    <DialogBox
      message={strings.ARE_YOU_SURE}
      middleButtons={[
        <Button
          key='button-1'
          label={strings.CANCEL}
          onClick={() => onClose()}
          priority='secondary'
          size='medium'
          type='passive'
        />,
        <Button key='button-2' label={strings.REMOVE} onClick={removePpSpecies} size='medium' type='destructive' />,
      ]}
      onClose={onClose}
      open={true}
      size='medium'
      skrim={true}
      title={strings.REMOVE_PROJECT}
    />
  );
}
