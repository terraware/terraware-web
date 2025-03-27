import React, { useCallback, useMemo, useState } from 'react';

import { Typography } from '@mui/material';
import { Button, Confirm, TableRowType } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';

interface RemoveFunderTopBarButtonProps {
  onConfirm: (selectedRows: TableRowType[]) => void;
  selectedRows: TableRowType[];
}

function RemoveFunderTopBarButton({ onConfirm, selectedRows }: RemoveFunderTopBarButtonProps) {
  const { activeLocale } = useLocalization();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const _onConfirm = useCallback(() => {
    onConfirm(selectedRows);
    setIsModalOpen(false);
  }, [onConfirm, selectedRows]);

  const titleText = useMemo(() => {
    if (!activeLocale || !selectedRows.length) {
      return '';
    }
    if (selectedRows.length > 1) {
      return strings.REMOVE_FUNDERS;
    } else {
      return strings.REMOVE_FUNDER;
    }
  }, [activeLocale, selectedRows]);

  const modalText = useMemo(() => {
    if (!activeLocale || !selectedRows.length) {
      return '';
    }
    if (selectedRows.length > 1) {
      return strings.REMOVE_FUNDERS_MODAL_TEXT;
    } else {
      return strings
        .formatString(strings.REMOVE_FUNDER_MODAL_TEXT, selectedRows[0].firstName ?? selectedRows[0].email)
        .toString();
    }
  }, [activeLocale, selectedRows]);

  return (
    <>
      <Button
        icon='iconTrashCan'
        onClick={() => setIsModalOpen(true)}
        label={titleText}
        priority={'secondary'}
        type={'destructive'}
      />

      <Confirm
        closeButtonId='cancelButton'
        closeButtonText={strings.CANCEL}
        confirmButtonId='remove'
        confirmButtonText={strings.REMOVE}
        confirmButtonType='destructive'
        message={<Typography>{modalText}</Typography>}
        onClose={() => setIsModalOpen(false)}
        onConfirm={_onConfirm}
        open={isModalOpen}
        title={titleText}
      />
    </>
  );
}

export default RemoveFunderTopBarButton;
