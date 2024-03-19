import React, { useCallback, useState } from 'react';

import { Typography } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';

interface RemoveRolesTopBarButtonProps {
  onConfirm: () => void;
}

function RemoveRolesTopBarButton({ onConfirm }: RemoveRolesTopBarButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const _onConfirm = useCallback(() => {
    onConfirm();
    setIsModalOpen(false);
  }, [onConfirm]);

  return (
    <>
      <Button
        icon='iconTrashCan'
        onClick={() => setIsModalOpen(true)}
        label={strings.REMOVE_ACCESS}
        priority={'secondary'}
        type={'destructive'}
      />

      <DialogBox
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        title={strings.REMOVE_ACCESS}
        size={'medium'}
        middleButtons={[
          <Button
            label={strings.CANCEL}
            priority='secondary'
            type='passive'
            onClick={() => setIsModalOpen(false)}
            key='button-1'
            id='cancelButton'
          />,
          <Button
            label={strings.REMOVE_ACCESS}
            onClick={_onConfirm}
            key='button-2'
            id='remove'
            priority={'primary'}
            type={'destructive'}
          />,
        ]}
      >
        <Typography>{strings.NOTE_COLON}</Typography>
        <Typography>{strings.REMOVE_ACCESS_MODAL_TEXT}</Typography>
      </DialogBox>
    </>
  );
}

export default RemoveRolesTopBarButton;
