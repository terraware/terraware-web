import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { Project, ServerOrganization } from 'src/types/Organization';
import { getOrganizationProjects } from 'src/utils/organization';
import TfMain from '../common/TfMain';
import ProjectsCellRenderer from './TableCellRenderer';
import PageSnackbar from 'src/components/PageSnackbar';

const useStyles = makeStyles((theme) =>
  createStyles({
    title: {
      marginTop: 0,
      fontSize: '24px',
    },
    mainContainer: {
      padding: '24px',
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
        pathname: APP_PATHS.PROJECTS_VIEW.replace(':projectId', selected.id.toString()),
      };
      history.push(viewProjectLocation);
    }
  };

  const goToNewProject = () => {
    const newProjectLocation = {
      pathname: APP_PATHS.PROJECTS_NEW,
    };
    history.push(newProjectLocation);
  };

  return (
    <TfMain>
      <Grid container spacing={3}>
        <Grid item xs={2}>
          <h1 className={classes.title}>{strings.PROJECTS}</h1>
          <p>{strings.PROJECTS_DESCRIPTION}</p>
        </Grid>
        <Grid item xs={8} />
        <Grid item xs={2} className={classes.centered}>
          {organization && ['Admin', 'Owner'].includes(organization?.role) && (
            <Button id='new-project' label={strings.ADD_PROJECT} onClick={goToNewProject} size='medium' />
          )}
        </Grid>
        <PageSnackbar />
        <Grid item xs={12}>
          <div className={classes.mainContent}>
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
          </div>
        </Grid>
        <Grid item xs={1} />
      </Grid>
    </TfMain>
  );
}
