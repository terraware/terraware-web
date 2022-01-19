import { Grid, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useState } from 'react';
import strings from 'src/strings';
import DialogCloseButton from '../common/DialogCloseButton';
import Button from '../common/button/Button';
import { OrganizationUser } from 'src/types/User';
import { TableColumnType } from '../common/table/types';
import Table from 'src/components/common/table';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      textAlign: 'center',
    },
    actions: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing(4),
    },
  })
);

export interface AddPeopleDialogProps {
  open: boolean;
  onClose: () => void;
  peopleOnProject?: OrganizationUser[];
  people?: OrganizationUser[];
  setPeopleOnProject: (people: OrganizationUser[]) => void;
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

  const [selectedRows, setSelectedRows] = useState<OrganizationUser[]>();

  const onSubmitHandler = () => {
    if (selectedRows) {
      setPeopleOnProject(selectedRows);
    }
    onClose();
  };

  return (
    <Dialog onClose={onClose} disableEscapeKeyDown open={open} maxWidth='md'>
      <DialogTitle className={classes.title}>
        <Typography variant='h6'>{strings.ADD_PEOPLE}</Typography>
        <DialogCloseButton onClick={onClose} />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={4}>
          <Table
            rows={people || []}
            orderBy='name'
            columns={peopleColumns}
            showCheckbox={true}
            previousSelectedRows={peopleOnProject}
            setSelectedRows={setSelectedRows}
          />
        </Grid>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button label={strings.CANCEL} priority='secondary' onClick={onClose} />
        <Button label={strings.ADD_PEOPLE} onClick={onSubmitHandler} />
      </DialogActions>
    </Dialog>
  );
}
