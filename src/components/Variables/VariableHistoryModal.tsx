import React, { type JSX, useCallback } from 'react';

import DialogBox from 'src/components/common/ScrollableDialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

import { VariableHistoryTable } from './VariableHistoryTable';

type VariableHistoryModalProps = {
  open: boolean;
  projectId: number;
  setOpen: (open: boolean) => void;
  variableId: number;
};

const VariableHistoryModal = ({ open, projectId, setOpen, variableId }: VariableHistoryModalProps): JSX.Element => {
  const onClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.VARIABLE_HISTORY}
      size='x-large'
      middleButtons={[<Button label={strings.CLOSE} onClick={onClose} key={'close-button'} />]}
      style={{ zIndex: 1301 }}
    >
      <VariableHistoryTable projectId={projectId} variableId={variableId} />
    </DialogBox>
  );
};

export default VariableHistoryModal;
