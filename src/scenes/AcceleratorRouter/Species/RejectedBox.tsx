import React, { useCallback, useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Message } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { ParticipantProjectSpecies } from 'src/services/ParticipantProjectSpeciesService';
import strings from 'src/strings';

const useStyles = makeStyles(() => ({
  icon: {
    marginLeft: '-1px',
    marginTop: '-1px',
  },
}));

interface RejectedBoxProps {
  participantProjectSpecies: ParticipantProjectSpecies;
  onSubmit: (feedback: string) => void;
}

const RejectedBox = ({ participantProjectSpecies, onSubmit }: RejectedBoxProps) => {
  const classes = useStyles();

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [feedback, setFeedback] = useState(participantProjectSpecies.feedback || '');

  const toggleDialog = useCallback(() => {
    setIsDialogOpen((prev) => !prev);
  }, []);

  const handleUpdate = () => {
    onSubmit(feedback);
    setIsDialogOpen(false);
  };

  return (
    <>
      <Box display='flex' alignItems='center' width='100%' marginBottom={4}>
        <Message
          title={strings.SPECIES_NOT_ACCEPTED}
          priority='critical'
          body={
            <Box>
              <Typography>{participantProjectSpecies.feedback}</Typography>
              <Box textAlign='right'>
                <Button
                  className={classes.icon}
                  icon='iconEdit'
                  onClick={toggleDialog}
                  priority='secondary'
                  size='small'
                  type='passive'
                  label={strings.EDIT_FEEDBACK}
                />
              </Box>
            </Box>
          }
          type='page'
        />
      </Box>
      <DialogBox
        onClose={toggleDialog}
        open={isDialogOpen}
        title={strings.EDIT_FEEDBACK}
        size='large'
        middleButtons={[
          <Button
            id='cancelEditFeedback'
            label={strings.CANCEL}
            priority='secondary'
            type='passive'
            onClick={toggleDialog}
            key='button-1'
          />,
          <Button id='updateFeedback' label={strings.SAVE} onClick={handleUpdate} key='button-2' />,
        ]}
      >
        <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
          <Grid item xs={12}>
            <TextField
              label={''}
              type='textarea'
              id='feedback'
              onChange={(value) => setFeedback(value as string)}
              value={feedback}
              preserveNewlines
            />
          </Grid>
        </Grid>
      </DialogBox>
    </>
  );
};

export default RejectedBox;
