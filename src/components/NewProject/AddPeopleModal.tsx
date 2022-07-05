import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Theme, Typography } from '@mui/material';
import React, { useState } from 'react';
import strings from 'src/strings';
import dictionary from 'src/strings/dictionary';
import DialogCloseButton from '../common/DialogCloseButton';
import Button from '../common/button/Button';
import { OrganizationUser } from 'src/types/User';
import { TableColumnType } from '../common/table/types';
import Table from 'src/components/common/table';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    textAlign: 'center',
    paddingTop: '32px',
    // Needed so that the title text doesn't overlap with the 'x' button
    paddingRight: '50px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4),
  },
  peopleModal: {
    '& .MuiDialog-paper': {
      minWidth: '720px',
      minHeight: '232px',
    },
  },
  emptyMessage: {
    marginBottom: '30px',
    textAlign: 'center',
    width: '100%',
  },
}));

export interface AddPeopleDialogProps {
  open: boolean;
  onClose: () => void;
  peopleOnProject?: OrganizationUser[];
  people?: OrganizationUser[];
  setPeopleOnProject: React.Dispatch<React.SetStateAction<OrganizationUser[] | undefined>>;
}

const peopleColumns: TableColumnType[] = [
  { key: 'firstName', name: 'First Name', type: 'string' },
  { key: 'lastName', name: 'Last Name', type: 'string' },
  { key: 'email', name: 'Email', type: 'string' },
  { key: 'role', name: 'Role', type: 'string' },
];

export default function AddPeopleDialog(props: AddPeopleDialogProps): JSX.Element {
  const classes = useStyles();
  const { onClose, open, people, setPeopleOnProject, peopleOnProject } = props;

  const [selectedRows, setSelectedRows] = useState<OrganizationUser[]>(peopleOnProject ?? []);

  const onSubmitHandler = () => {
    if (selectedRows) {
      setPeopleOnProject((current: OrganizationUser[] | undefined) => {
        if (current) {
          return [...current, ...selectedRows];
        } else {
          return selectedRows;
        }
      });
    }
    onClose();
  };

  const getModalTitle = (): string => {
    if (people && people.length > 0) {
      return dictionary.ADD_CONTRIBUTORS;
    } else if (peopleOnProject && peopleOnProject.length > 0) {
      return strings.NO_UNSELECTED_PEOPLE;
    }

    return strings.NO_PEOPLE_IN_ORG;
  };

  return (
    <Dialog onClose={onClose} disableEscapeKeyDown open={open} maxWidth='md' className={classes.peopleModal}>
      <DialogTitle className={classes.title}>
        <Typography variant='h6'>{getModalTitle()}</Typography>
        <DialogCloseButton onClick={onClose} />
      </DialogTitle>
      <DialogContent dividers={people && people.length > 0}>
        <Grid container spacing={4} alignContent='center'>
          {people && people.length > 0 ? (
            <Table
              rows={people}
              orderBy='name'
              columns={peopleColumns}
              showCheckbox={true}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
            />
          ) : (
            <p className={classes.emptyMessage}>{strings.ADD_PEOPLE_MESSAGE}</p>
          )}
        </Grid>
      </DialogContent>
      <DialogActions className={classes.actions}>
        {people && people.length > 0 ? (
          <>
            <Button label={strings.CANCEL} priority='secondary' onClick={onClose} />
            <Button label={dictionary.ADD_CONTRIBUTORS} onClick={onSubmitHandler} />
          </>
        ) : (
          <Button label={strings.GOT_IT} onClick={onClose} />
        )}
      </DialogActions>
    </Dialog>
  );
}
