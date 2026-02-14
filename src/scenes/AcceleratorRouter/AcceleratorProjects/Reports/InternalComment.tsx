import React, { useCallback, useEffect, useState } from 'react';

import { Box, Grid } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { AcceleratorReportPayload } from 'src/queries/generated/reports';
import strings from 'src/strings';
import { AcceleratorReportStatus, AcceleratorReportStatuses } from 'src/types/AcceleratorReport';

interface InternalCommentProps {
  entity: AcceleratorReportPayload;
  update: (internalComment: string, status: AcceleratorReportStatus) => void;
  disabled?: boolean;
}

function InternalComment({ entity, update, disabled }: InternalCommentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [internalComment, setInternalComment] = useState(entity.internalComment || '');
  const [status, setStatus] = useState<AcceleratorReportStatus>(entity.status || '');

  const toggleDialog = useCallback(() => {
    setIsDialogOpen((prev) => !prev);
  }, []);

  const handleUpdate = useCallback(() => {
    update(internalComment, status);
    toggleDialog();
  }, [internalComment, status, toggleDialog, update]);

  useEffect(() => {
    if (entity.internalComment) {
      setInternalComment(entity.internalComment);
    }
  }, [entity.internalComment]);

  useEffect(() => {
    setStatus(entity.status);
  }, [entity.status]);

  const setInternalCommentCallback = useCallback((value: any) => {
    setInternalComment(value as string);
  }, []);

  const setStatusCallback = useCallback((value: any) => {
    setStatus(value as AcceleratorReportStatus);
  }, []);

  const dropdownOptions: DropdownItem[] = AcceleratorReportStatuses.filter((_status) => _status !== 'Not Needed').map(
    (_status) => ({
      label: _status,
      value: _status,
    })
  );

  return (
    <>
      <Box display='flex' alignItems='center'>
        <strong>{strings.INTERNAL_COMMENTS}</strong>
        {!disabled && (
          <Button
            icon='iconEdit'
            onClick={toggleDialog}
            priority='ghost'
            size='small'
            type='passive'
            style={{
              marginLeft: '-1px',
              marginTop: '-1px',
            }}
          />
        )}
      </Box>
      <TextField
        display
        id='internalComment'
        label={''}
        onChange={setInternalCommentCallback}
        preserveNewlines
        type='textarea'
        value={entity.internalComment ?? strings.NO_COMMENTS_ADDED}
      />
      <DialogBox
        onClose={toggleDialog}
        open={isDialogOpen}
        title={strings.DOCUMENT_STATUS}
        size='large'
        middleButtons={[
          <Button
            id='cancelEditInternalComment'
            label={strings.CANCEL}
            priority='secondary'
            type='passive'
            onClick={toggleDialog}
            key='button-1'
          />,
          <Button id='updateInternalComment' label={strings.SAVE} onClick={handleUpdate} key='button-2' />,
        ]}
      >
        <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
          <Grid item xs={12}>
            <TextField
              label={strings.INTERNAL_COMMENTS}
              type='textarea'
              id='internalComment'
              onChange={setInternalCommentCallback}
              value={internalComment}
              preserveNewlines
            />
          </Grid>
          <Grid item xs={12}>
            <Dropdown
              fullWidth={true}
              label={strings.STATUS}
              onChange={setStatusCallback}
              options={dropdownOptions}
              required
              disabled={entity.status === 'Not Submitted' || entity.status === 'Not Needed'}
              selectedValue={status}
            />
          </Grid>
        </Grid>
      </DialogBox>
    </>
  );
}

export default InternalComment;
