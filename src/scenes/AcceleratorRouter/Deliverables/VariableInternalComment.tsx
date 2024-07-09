import React, { useCallback, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import { VariableWithValues } from 'src/types/documentProducer/Variable';

interface VariableInternalCommentProps {
  variable: VariableWithValues;
  update: (internalComment: string) => void;
  editing: boolean;
}

function VariableInternalComment({ variable, update, editing }: VariableInternalCommentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [internalComment, setInternalComment] = useState(
    variable.variableValues && variable.variableValues.length > 0
      ? variable.variableValues[0].internalComment || ''
      : ''
  );
  const theme = useTheme();

  const toggleDialog = useCallback(() => {
    setIsDialogOpen((prev) => !prev);
  }, []);

  const handleUpdate = () => {
    update(internalComment);
    toggleDialog();
  };

  return (
    (editing || internalComment) && (
      <>
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
            value={internalComment && internalComment !== '' ? internalComment : strings.NO_COMMENTS_ADDED}
            sx={{ padding: '0 8px' }}
          />
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
      </>
    )
  );
}

export default VariableInternalComment;
