import React, { useCallback, useState } from 'react';

import { Typography } from '@mui/material';
import { Button, Confirm } from '@terraware/web-components';

import strings from 'src/strings';

interface RemoveOrgsTopBarButtonProps {
  onConfirm: () => void;
}

function RemoveOrgsTopBarButton({ onConfirm }: RemoveOrgsTopBarButtonProps) {
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
        label={strings.REMOVE}
        priority={'secondary'}
        type={'destructive'}
      />

      <Confirm
        closeButtonId='cancelButton'
        closeButtonText={strings.CANCEL}
        confirmButtonId='remove'
        confirmButtonText={strings.REMOVE}
        confirmButtonType='destructive'
        message={
          <>
            <Typography>{strings.REMOVE_ORGANIZATION_MODAL_TEXT}</Typography>
          </>
        }
        onClose={() => setIsModalOpen(false)}
        onConfirm={_onConfirm}
        open={isModalOpen}
        title={strings.REMOVE_ORGANIZATION}
      />
    </>
  );
}

export default RemoveOrgsTopBarButton;
