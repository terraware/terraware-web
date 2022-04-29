import { Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import strings from 'src/strings';
import DialogCloseButton from '../common/DialogCloseButton';
import Button from '../common/button/Button';
import dictionary from 'src/strings/dictionary';
import { OrganizationUser } from 'src/types/User';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      textAlign: 'center',
      padding: theme.spacing(6, 6, 2, 6),
    },
    actions: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing(4),
    },
    content: {
      textAlign: 'center',
    },
  })
);

export interface RemovePeopleDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  removedPeople: OrganizationUser[];
}

export default function RemovePeopleDialog(props: RemovePeopleDialogProps): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onSubmit, removedPeople } = props;

  return (
    <Dialog onClose={() => onClose()} disableEscapeKeyDown open={open} maxWidth='sm'>
      <DialogTitle className={classes.title}>
        <Typography variant='h6'>
          {removedPeople.length > 1 ? dictionary.REMOVE_PEOPLE : dictionary.REMOVE_PERSON}
        </Typography>
        <DialogCloseButton onClick={onClose} />
      </DialogTitle>
      <DialogContent className={classes.content}>
        <p>
          {removedPeople.length > 1
            ? dictionary.REMOVE_PEOPLE_DESC
            : strings.formatString(dictionary.REMOVE_PERSON_DESC, removedPeople[0].firstName || '')}
        </p>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button label={strings.CANCEL} priority='secondary' type='passive' onClick={onClose} />
        <Button label={strings.REMOVE} type='destructive' onClick={onSubmit} />
      </DialogActions>
    </Dialog>
  );
}
