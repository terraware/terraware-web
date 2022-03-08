import { Container, createStyles, Grid, makeStyles } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import dictionary from 'src/strings/dictionary';
import { Project, ServerOrganization } from 'src/types/Organization';
import Icon from '../common/icon/Icon';
import TfDivisor from '../common/TfDivisor';
import Table from 'src/components/common/table';
import { TableColumnType } from '../common/table/types';
import { getProjectsById } from 'src/utils/organization';
import { OrganizationUser } from 'src/types/User';
import { getOrganizationUsers } from 'src/api/organization/organization';
import Button from '../common/button/Button';
import Textfield from '../common/Textfield/Textfield';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
      background: '#ffffff',
    },
    backIcon: {
      fill: '#007DF2',
      marginRight: theme.spacing(1),
    },
    back: {
      display: 'flex',
      textDecoration: 'none',
      color: '#0067C8',
      fontSize: '20px',
      alignItems: 'center',
    },
    titleWithButton: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  })
);

type ProjectDetailsProps = {
  organization?: ServerOrganization;
};
export default function ProjectDetails({ organization }: ProjectDetailsProps): JSX.Element {
  const { projectId } = useParams<{ projectId: string }>();
  const [projectSelected, setProjectSelected] = useState<Project | null>();
  const [people, setPeople] = useState<OrganizationUser[]>();
  const history = useHistory();

  useEffect(() => {
    const populatePeople = async () => {
      if (organization) {
        const response = await getOrganizationUsers(organization);
        if (response.requestSucceeded) {
          setPeople(response.users);
        }
      }
    };
    if (organization) {
      const projects = getProjectsById(organization);
      const selectedProject = projects.get(parseInt(projectId, 10));
      if (selectedProject) {
        setProjectSelected(selectedProject);
        populatePeople();
      } else {
        history.push(APP_PATHS.PROJECTS);
      }
    }
  }, [projectId, organization, history]);

  const classes = useStyles();

  const columns: TableColumnType[] = [
    { key: 'name', name: 'Name', type: 'string' },
    { key: 'description', name: 'Description', type: 'string' },
    { key: 'longitude', name: 'Longitude', type: 'string' },
    { key: 'latitude', name: 'Latitude', type: 'string' },
  ];

  const peopleColumns: TableColumnType[] = [
    { key: 'firstName', name: 'First Name', type: 'string' },
    { key: 'lastName', name: 'Last Name', type: 'string' },
    { key: 'email', name: 'Email', type: 'string' },
    { key: 'role', name: 'Role', type: 'string' },
  ];

  const goToEditProject = () => {
    const newProjectLocation = {
      pathname: APP_PATHS.PROJECTS_EDIT.replace(':projectId', projectId),
    };
    history.push(newProjectLocation);
  };

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Link id='back' to={APP_PATHS.PROJECTS} className={classes.back}>
            <Icon name='caretLeft' className={classes.backIcon} />
            {strings.PROJECTS}
          </Link>
        </Grid>
        <Grid item xs={12} className={classes.titleWithButton}>
          <h2>{projectSelected?.name}</h2>
          <Button label={strings.EDIT_PROJECT} priority='secondary' onClick={goToEditProject} />
        </Grid>
        <Grid item xs={4}>
          <Textfield label={strings.NAME} display={true} value={projectSelected?.name} id='name' type='text' />
        </Grid>
        <Grid item xs={4}>
          <Textfield
            label={strings.DESCRIPTION}
            display={true}
            value={projectSelected?.description}
            id='description'
            type='text'
          />
        </Grid>
        <Grid item xs={4}>
          <Textfield
            label={strings.START_DATE_OPT}
            display={true}
            value={projectSelected?.startDate}
            id='startDate'
            type='text'
          />
        </Grid>
        <Grid item xs={4}>
          <Textfield
            label={strings.STATUS_OPT}
            display={true}
            value={projectSelected?.status}
            id='status'
            type='text'
          />
        </Grid>
        <Grid item xs={4}>
          <Textfield
            label={strings.PROJECT_TYPE_OPT}
            display={true}
            value={projectSelected?.types?.join(', ')}
            id='projectType'
            type='text'
          />
        </Grid>
        <Grid item xs={12} />
        <Grid item xs={12}>
          <TfDivisor />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <h2>{dictionary.CONTRIBUTORS}</h2>
          <p>{strings.PEOPLE_DESC}</p>
        </Grid>
        {projectSelected && people && (
          <Grid item xs={12}>
            <Table
              rows={people.filter((user) => user.projectIds.includes(projectSelected.id))}
              orderBy='name'
              columns={peopleColumns}
            />
          </Grid>
        )}
        <Grid item xs={12} />
        <Grid item xs={12}>
          <TfDivisor />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <h2>{strings.SITES}</h2>
          <p>{strings.SITES_DESC}</p>
        </Grid>
        {projectSelected?.sites && (
          <Grid item xs={12}>
            <Table rows={projectSelected.sites} orderBy='firstName' columns={columns} />
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
