import React from 'react';
import strings from 'src/strings';
import DialogCloseButton from '../common/DialogCloseButton';
import Button from '../common/button/Button';
import { Dialog, DialogActions, DialogContent, DialogTitle, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    textAlign: 'center',
  },
  title: {
    padding: theme.spacing(6, 6, 2, 6),
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4),
  },
}));

export interface RemovedProjectsWarningModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  removedProjectNames: string[];
}

export default function RemovedProjectsWarningModal(props: RemovedProjectsWarningModalProps): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onSubmit, removedProjectNames } = props;

  return (
    <Dialog onClose={() => onClose()} disableEscapeKeyDown open={open} maxWidth='sm' className={classes.container}>
      <DialogTitle className={classes.title}>
        <Typography variant='h6'>{strings.REMOVED_PERSON_FROM_PROJECTS_WARNING}</Typography>
        <DialogCloseButton onClick={onClose} />
      </DialogTitle>
      <DialogContent>
        {strings.formatString(strings.REMOVED_PERSON_FROM_PROJECTS_WARNING_DESCRIPTION, removedProjectNames.join(', '))}
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button label={strings.CANCEL} priority='secondary' type='passive' onClick={onClose} />
        <Button label={strings.REMOVE_AND_SAVE} type='destructive' onClick={onSubmit} />
      </DialogActions>
    </Dialog>
  );
}
