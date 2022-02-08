import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import strings from 'src/strings';
import { Project, ServerOrganization } from 'src/types/Organization';
import { getOrganizationProjects } from 'src/utils/organization';
import ProjectsCellRenderer from './TableCellRenderer';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    mainContent: {
      paddingTop: theme.spacing(4),
    },
    centered: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
  })
);

const columns: TableColumnType[] = [
  { key: 'name', name: 'Name', type: 'string' },
  { key: 'description', name: 'Description', type: 'string' },
  { key: 'startDate', name: 'Start Date', type: 'string' },
  { key: 'status', name: 'Status', type: 'string' },
  { key: 'types', name: 'Project Type(s)', type: 'string' },
];

type ProjectsListProps = {
  organization?: ServerOrganization;
};

export default function ProjectsList({ organization }: ProjectsListProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();

  const onSelect = (selected: Project) => {
    if (selected.id) {
      const viewProjectLocation = {
        pathname: `/projects/${selected.id}`,
      };
      history.push(viewProjectLocation);
    }
  };

  const goToNewProject = () => {
    const newProjectLocation = {
      pathname: `/projects/new`,
    };
    history.push(newProjectLocation);
  };

  return (
    <main>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={1} />
          <Grid item xs={2}>
            <h1>{strings.PROJECTS}</h1>
            <p>{strings.PROJECTS_DESCRIPTION}</p>
          </Grid>
          <Grid item xs={6} />
          <Grid item xs={2} className={classes.centered}>
            {organization && ['Admin', 'Owner'].includes(organization?.role) && (
              <Button id='new-project' label={strings.ADD_PROJECT} onClick={goToNewProject} />
            )}
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={1} />
          <Grid item xs={10}>
            <Paper className={classes.mainContent}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  {organization?.projects && (
                    <Table
                      id='projects-table'
                      columns={columns}
                      rows={getOrganizationProjects(organization)}
                      orderBy='name'
                      onSelect={onSelect}
                      Renderer={ProjectsCellRenderer}
                    />
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={1} />
        </Grid>
      </Container>
    </main>
  );
}
