import { Container, createStyles, Grid, makeStyles } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import strings from 'src/strings';
import { Project, ServerOrganization } from 'src/types/Organization';
import Icon from '../common/icon/Icon';
import TfDivisor from '../common/TfDivisor';
import Table from 'src/components/common/table';
import { TableColumnType } from '../common/table/types';
import { getProjectsById } from 'src/utils/organization';
import { OrganizationUser } from 'src/types/User';
import { getOrganizationUsers } from 'src/api/organization/organization';

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
    value: {
      fontSize: '16px',
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
      setProjectSelected(projects.get(parseInt(projectId, 10)));
      populatePeople();
    }
  }, [projectId, organization]);

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

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Link id='back' to='/projects' className={classes.back}>
            <Icon name='caretLeft' className={classes.backIcon} />
            {strings.PROJECTS}
          </Link>
        </Grid>
        <Grid item xs={12}>
          <h2>{projectSelected?.name}</h2>
        </Grid>
        <Grid item xs={4}>
          <p>{strings.NAME}</p>
          <p className={classes.value}>{projectSelected?.name}</p>
        </Grid>
        <Grid item xs={4}>
          <p>{strings.DESCRIPTION}</p>
          <p className={classes.value}>{projectSelected?.description}</p>
        </Grid>
        <Grid item xs={4}>
          <p>{strings.START_DATE_OPT}</p>
          <p className={classes.value}>{projectSelected?.startDate}</p>
        </Grid>
        <Grid item xs={4}>
          <p>{strings.STATUS_OPT}</p>
          <p className={classes.value}>{projectSelected?.status}</p>
        </Grid>
        <Grid item xs={4}>
          <p>{strings.PROJECT_TYPE_OPT}</p>
          <p className={classes.value}>{projectSelected?.types?.join(', ')}</p>
        </Grid>
        <Grid item xs={12} />
        <Grid item xs={12}>
          <TfDivisor />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <h2>{strings.PEOPLE}</h2>
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
