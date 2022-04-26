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
import Select from '../common/Select/Select';
import { OrganizationUser } from 'src/types/User';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainModal: {
      '& .MuiDialog-scrollPaper': {
        '& .MuiDialog-paper': {
          overflow: 'visible',
        },
      },
    },
    paper: {
      minWidth: '515px',
    },
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
      overflow: 'visible',
    },
    select: {
      width: '100%',
      textAlign: 'left',
      '& .textfield-container': {
        width: '100%',
      },
    },
  })
);

export interface AssignNewOwnerDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  people: OrganizationUser[];
  setNewOwner: React.Dispatch<React.SetStateAction<OrganizationUser | undefined>>;
  selectedOwner: OrganizationUser | undefined;
}

export default function AssignNewOwnerDialog(props: AssignNewOwnerDialogProps): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onSubmit, people, setNewOwner, selectedOwner } = props;

  return (
    <Dialog
      onClose={() => onClose()}
      disableEscapeKeyDown
      open={open}
      maxWidth='sm'
      className={classes.mainModal}
      classes={{ paper: classes.paper }}
    >
      <DialogTitle className={classes.title}>
        <Typography variant='h6'>{dictionary.ASSIGN_NEW_OWNER}</Typography>
        <DialogCloseButton onClick={onClose} />
      </DialogTitle>
      <DialogContent className={classes.content}>
        <p>{strings.ASSIGN_NEW_OWNER_DESC}</p>
        <Select
          options={people.map((person) => {
            return person.email;
          })}
          onChange={(newValue: string) => setNewOwner(people.find((person) => person.email === newValue))}
          selectedValue={selectedOwner?.email}
          className={classes.select}
        />
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button label={strings.CANCEL} priority='secondary' type='passive' onClick={onClose} />
        <Button label={strings.ASSIGN} onClick={onSubmit} />
      </DialogActions>
    </Dialog>
  );
}
