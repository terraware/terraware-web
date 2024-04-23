import React, { useCallback, useState } from 'react';

import { Typography } from '@mui/material';
import { Button, Confirm } from '@terraware/web-components';

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

      <Confirm
        closeButtonId='cancelButton'
        closeButtonText={strings.CANCEL}
        confirmButtonId='remove'
        confirmButtonText={strings.REMOVE_ACCESS}
        confirmButtonType='destructive'
        message={
          <>
            <Typography>{strings.NOTE_COLON}</Typography>
            <Typography>{strings.REMOVE_ACCESS_MODAL_TEXT}</Typography>
          </>
        }
        onClose={() => setIsModalOpen(false)}
        onConfirm={_onConfirm}
        open={isModalOpen}
        title={strings.REMOVE_ACCESS}
      />
    </>
  );
}

export default RemoveRolesTopBarButton;
