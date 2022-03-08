import { Container, createStyles, Grid, makeStyles } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { getOrganizationUsers } from 'src/api/organization/organization';
import { listAllProjects } from 'src/api/project/project';
import Button from 'src/components/common/button/Button';
import Icon from 'src/components/common/icon/Icon';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import TextField from 'src/components/common/Textfield/Textfield';
import TfDivisor from 'src/components/common/TfDivisor';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import dictionary from 'src/strings/dictionary';
import { Project, ServerOrganization } from 'src/types/Organization';
import { OrganizationUser } from 'src/types/User';
import { getOrganizationProjects } from 'src/utils/organization';
import { ProjectWithUserRole } from './NewPerson';
import TableCellRenderer from './TableCellRenderer';

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

type PersonDetailsProps = {
  organization?: ServerOrganization;
};

const projectColumns: TableColumnType[] = [
  { key: 'name', name: strings.NAME, type: 'string' },
  { key: 'description', name: strings.DESCRIPTION, type: 'string' },
  { key: 'sites', name: strings.SITES, type: 'string' },
  { key: 'totalUsers', name: strings.PEOPLE, type: 'string' },
  { key: 'role', name: strings.ROLE, type: 'string' },
];

export default function PersonDetails({ organization }: PersonDetailsProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const { personId } = useParams<{ personId: string }>();
  const [person, setPerson] = useState<OrganizationUser>();
  const [projectsOfPerson, setProjectsOfPerson] = useState<ProjectWithUserRole[]>();
  const [allProjects, setAllProjects] = useState<Project[]>();

  useEffect(() => {
    const populatePersonData = async () => {
      const response = await getOrganizationUsers(organization!);
      if (response.requestSucceeded) {
        const selectedUser = response.users.find((user) => user.id.toString() === personId);
        if (selectedUser) {
          setPerson(selectedUser);
        } else {
          history.push(APP_PATHS.PEOPLE);
        }
      }
    };
    const populateAllProjects = async () => {
      const response = await listAllProjects();
      if (response.requestSucceeded && organization) {
        const allProjectsServer = response.projects?.filter((project) => project.organizationId === organization.id);
        const projectsWithTotalUsers = getOrganizationProjects(organization)?.map((orgProj) => {
          return { ...orgProj, totalUsers: allProjectsServer?.find((pro) => pro.id === orgProj.id)?.totalUsers };
        });
        setAllProjects(projectsWithTotalUsers);
      }
    };
    if (organization) {
      populatePersonData();
      populateAllProjects();
    }
  }, [personId, organization, history]);

  useEffect(() => {
    const projects = person?.projectIds.reduce((filtered, projectId) => {
      const found = allProjects?.find((project) => project.id === projectId);
      if (found) {
        filtered.push({ ...found, role: person.role } as ProjectWithUserRole);
      }
      return filtered;
    }, [] as ProjectWithUserRole[]);
    setProjectsOfPerson(projects);
  }, [person, organization?.projects, allProjects]);

  const getDateAdded = () => {
    if (person?.addedTime) {
      return new Date(person.addedTime).toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
      });
    }
  };

  const goToEditPerson = () => {
    const newLocation = {
      pathname: APP_PATHS.PEOPLE_EDIT.replace(':personId', personId),
    };
    history.push(newLocation);
  };

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Link id='back' to={APP_PATHS.PEOPLE} className={classes.back}>
            <Icon name='caretLeft' className={classes.backIcon} />
            {strings.PEOPLE}
          </Link>
        </Grid>
        <Grid item xs={12} className={classes.titleWithButton}>
          <h2>{person?.email}</h2>
          <Button label={dictionary.EDIT_PERSON} priority='secondary' onClick={goToEditPerson} />
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.EMAIL} id='email' type='text' value={person?.email} display={true} />
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.FIRST_NAME} id='firstName' type='text' value={person?.firstName} display={true} />
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.LAST_NAME} id='lastName' type='text' value={person?.lastName} display={true} />
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.ROLE} id='role' type='text' value={person?.role} display={true} />
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.DATE_ADDED} id='addedTime' type='text' value={getDateAdded()} display={true} />
        </Grid>
        <Grid item xs={4} />
        <Grid item xs={12} />
        <Grid item xs={12}>
          <TfDivisor />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <h2>{strings.PROJECTS}</h2>
          <p>{strings.PROJECTS_DESC}</p>
        </Grid>
        {projectsOfPerson && (
          <Grid item xs={12}>
            <Table rows={projectsOfPerson} orderBy='name' columns={projectColumns} Renderer={TableCellRenderer} />
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
