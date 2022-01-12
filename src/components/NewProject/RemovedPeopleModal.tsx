import { Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { GerminationTest } from 'src/api/types/tests';
import strings from 'src/strings';
import DialogCloseButton from '../common/DialogCloseButton';
import Button from '../common/button/Button';
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
  })
);

export interface Props {
  open: boolean;
  onClose: (value?: GerminationTest) => void;
  onSubmit: () => void;
  removedPeople?: OrganizationUser[];
}

export default function RemovePeopleDialog(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onSubmit, removedPeople } = props;

  const removedPeopleNames = removedPeople?.map((person) => person.firstName);
  return (
    <Dialog onClose={() => onClose()} disableEscapeKeyDown open={open} maxWidth='sm'>
      <DialogTitle className={classes.title}>
        <Typography variant='h6'>{strings.REMOVED_PEOPLE_WARNING}</Typography>
        <DialogCloseButton onClick={onClose} />
      </DialogTitle>
      <DialogContent>
        <p>
          {strings.REMOVED_PEOPLE_WARNING_DESC} {removedPeopleNames?.join(', ')}
        </p>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button label={strings.CANCEL} priority='secondary' type='passive' onClick={onClose} />
        <Button label={strings.REMOVE_AND_SAVE} type='destructive' onClick={onSubmit} />
      </DialogActions>
    </Dialog>
  );
}
