import React, { useCallback, useEffect, useState } from 'react';

import { Box, Grid, SxProps, useTheme } from '@mui/material';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import { SectionVariableWithValues, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValue } from 'src/types/documentProducer/VariableValue';

interface VariableInternalCommentProps {
  variable: VariableWithValues | SectionVariableWithValues;
  update: (internalComment: string) => void;
  editing: boolean;
  sx?: SxProps;
}

function VariableInternalComment({ variable, update, editing, sx }: VariableInternalCommentProps) {
  const theme = useTheme();

  const variableValues = variable?.variableValues || [];

  // For section variables, multiple variableValues are returned, so we need to find the one with the current ID
  let variableValue: VariableValue | undefined;
  if (variable.type === 'Section') {
    variableValue = (variable?.variableValues || []).find((value) => value.variableId === variable.id);
  } else {
    variableValue = variableValues[0];
  }

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [internalComment, setInternalComment] = useState(variableValue?.internalComment || '');

  useEffect(() => {
    if (variableValue?.internalComment) {
      setInternalComment(variableValue?.internalComment);
    }
  }, [variableValue?.internalComment]);

  const toggleDialog = useCallback(() => {
    setIsDialogOpen((prev) => !prev);
    setInternalComment(variableValue?.internalComment || '');
  }, []);

  const handleUpdate = () => {
    update(internalComment);
    toggleDialog();
  };

  return (
    (editing || internalComment || isDialogOpen) && (
      <Box sx={[...(Array.isArray(sx) ? sx : [sx])]}>
        <Box
          display='flex'
          alignItems='center'
          border={`1px solid ${theme.palette.TwClrBaseGray100}`}
          sx={{ borderRadius: '8px' }}
          padding={2}
        >
          <strong>{strings.INTERNAL_COMMENTS}</strong>
          <TextField
            display
            id='internalComment'
            label={''}
            onChange={(value) => setInternalComment(value as string)}
            preserveNewlines
            type='textarea'
            value={variableValue?.internalComment || strings.NO_COMMENTS_ADDED}
            sx={{ padding: '0 8px' }}
          />
          {editing && (
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
        <DialogBox
          onClose={toggleDialog}
          open={isDialogOpen}
          title={strings.INTERNAL_COMMENTS}
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
                label={''}
                type='textarea'
                id='internalComment'
                onChange={(value) => setInternalComment(value as string)}
                value={internalComment}
                preserveNewlines
              />
            </Grid>
          </Grid>
        </DialogBox>
      </Box>
    )
  );
}

export default VariableInternalComment;
