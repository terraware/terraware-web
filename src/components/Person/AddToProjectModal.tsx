import React, { useState } from 'react';
import strings from 'src/strings';
import DialogCloseButton from '../common/DialogCloseButton';
import Button from '../common/button/Button';
import { TableColumnType } from '../common/table/types';
import Table from 'src/components/common/table';
import { Project } from 'src/types/Organization';
import TableCellRenderer from './TableCellRenderer';
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    paddingTop: '32px',
    // Needed so that the text doesn't overlap with the 'x' button
    paddingRight: '50px',
  },
  center: {
    textAlign: 'center',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4),
  },
  errorMessage: {
    width: '100%',
  },
}));

export interface AddPeopleDialogProps {
  open: boolean;
  onClose: () => void;
  projects?: Project[];
  projectsOfPerson: Project[] | undefined;
  setProjectsOfPerson: React.Dispatch<React.SetStateAction<Project[] | undefined>>;
}

const projectColumns: TableColumnType[] = [
  { key: 'name', name: 'Name', type: 'string' },
  { key: 'decription', name: 'Description', type: 'string' },
  { key: 'sites', name: 'Sites', type: 'string' },
  { key: 'totalUsers', name: 'People', type: 'string' },
];

export default function AddPeopleDialog(props: AddPeopleDialogProps): JSX.Element {
  const classes = useStyles();
  const { onClose, open, projects, projectsOfPerson, setProjectsOfPerson } = props;

  const [selectedRows, setSelectedRows] = useState<Project[]>([]);

  const onSubmitHandler = () => {
    if (selectedRows) {
      setProjectsOfPerson((current: Project[] | undefined) => {
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
    if (projects && projects.length > 0) {
      return strings.ADD_TO_PROJECT;
    } else if (projectsOfPerson && projectsOfPerson.length > 0) {
      return strings.NO_UNSELECTED_PROJECTS;
    }

    return strings.NO_PROJECTS_IN_ORG;
  };

  return (
    <Dialog onClose={onClose} disableEscapeKeyDown open={open} maxWidth='md' className={classes.center}>
      <DialogTitle className={classes.title}>
        <Typography variant='h6'>{getModalTitle()}</Typography>
        <DialogCloseButton onClick={onClose} />
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={4}>
          {projects && projects.length > 0 ? (
            <Table
              rows={projects}
              orderBy='name'
              columns={projectColumns}
              showCheckbox={true}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              Renderer={TableCellRenderer}
            />
          ) : (
            <p className={classes.errorMessage}>{strings.ADD_PROJECTS_MESSAGE}</p>
          )}
        </Grid>
      </DialogContent>
      <DialogActions className={classes.actions}>
        {projects && projects.length > 0 ? (
          <>
            <Button label={strings.CANCEL} priority='secondary' onClick={onClose} />
            <Button label={strings.ADD_TO_PROJECT} onClick={onSubmitHandler} />
          </>
        ) : (
          <Button label={strings.GOT_IT} onClick={onClose} />
        )}
      </DialogActions>
    </Dialog>
  );
}
