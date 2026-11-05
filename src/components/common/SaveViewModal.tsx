import React, { useCallback, useState } from 'react';

import { Box, Portal, Typography, useTheme } from '@mui/material';
import { PillList } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import { useCreateSavedTableViewMutation } from 'src/queries/generated/savedTableViews';
import useSnackbar from 'src/utils/useSnackbar';

export type SaveViewModalProps = {
  baseView?: string;
  onClose: () => void;
  onSaved?: (id: number) => void;
  open: boolean;
  organizationId?: number;
  settings: Record<string, any>;
  summary?: string[];
  tableName: string;
};

const SaveViewModal = ({
  baseView,
  onClose,
  onSaved,
  open,
  organizationId,
  settings,
  summary,
  tableName,
}: SaveViewModalProps) => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const [createSavedTableView, { isLoading }] = useCreateSavedTableViewMutation();
  const [name, setName] = useState('');
  const [errorText, setErrorText] = useState('');

  const handleClose = useCallback(() => {
    setName('');
    setErrorText('');
    onClose();
  }, [onClose]);

  const handleNameChange = useCallback((value: unknown) => {
    setName((value as string) ?? '');
    setErrorText('');
  }, []);

  const saveView = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorText(strings.REQUIRED_FIELD);
      return;
    }

    try {
      const response = await createSavedTableView({
        baseView,
        name: trimmedName,
        organizationId,
        settings,
        tableName,
      }).unwrap();
      onSaved?.(response.id);
      snackbar.toastSuccess(strings.formatString(strings.SAVED_VIEW_CREATED, trimmedName));
      handleClose();
    } catch {
      snackbar.toastError();
    }
  }, [
    baseView,
    createSavedTableView,
    handleClose,
    name,
    onSaved,
    organizationId,
    settings,
    snackbar,
    strings,
    tableName,
  ]);

  const handleSave = useCallback(() => void saveView(), [saveView]);

  return (
    <Portal>
      <DialogBox
        onClose={handleClose}
        open={open}
        title={strings.SAVE_VIEW}
        size='medium'
        middleButtons={[
          <Button
            id='cancelSaveView'
            key='cancel'
            label={strings.CANCEL}
            onClick={handleClose}
            priority='secondary'
            type='passive'
          />,
          <Button
            disabled={isLoading}
            id='saveView'
            key='save'
            label={strings.SAVE_VIEW_BUTTON}
            onClick={handleSave}
          />,
        ]}
      >
        <Box textAlign='left'>
          <TextField
            autoFocus
            errorText={errorText}
            id='save-view-name'
            label={strings.VIEW_NAME}
            onChange={handleNameChange}
            type='text'
            value={name}
          />
          {summary && (
            <Box marginTop={theme.spacing(2)}>
              <Typography fontSize='14px' fontWeight={600}>
                {strings.THIS_VIEW_SAVES}
              </Typography>
              <Box marginTop={theme.spacing(1)}>
                <PillList data={summary.map((item, index) => ({ id: index, value: item }))} />
              </Box>
            </Box>
          )}
          <Typography fontSize='14px' marginTop={theme.spacing(2)} color={theme.palette.TwClrTxtSecondary}>
            {strings.SAVED_VIEWS_PRIVATE}
          </Typography>
        </Box>
      </DialogBox>
    </Portal>
  );
};

export default SaveViewModal;
