import { Container, createStyles, Grid, makeStyles } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import Icon from '../common/icon/Icon';
import TfDivisor from '../common/TfDivisor';
import TextField from '../common/Textfield/Textfield';
import { OrganizationUser } from 'src/types/User';
import { getOrganizationUsers } from 'src/api/organization/organization';
import { ProjectOfPerson } from '../NewPerson';
import Table from 'src/components/common/table';
import { TableColumnType } from '../common/table/types';
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
  { key: 'name', name: 'Name', type: 'string' },
  { key: 'description', name: 'Description', type: 'string' },
  { key: 'sites', name: 'Sites', type: 'string' },
  { key: 'people', name: 'People', type: 'string' },
  { key: 'role', name: 'Role', type: 'string' },
];

export default function PersonDetails({ organization }: PersonDetailsProps): JSX.Element {
  const classes = useStyles();
  const { personId } = useParams<{ personId: string }>();
  const [person, setPerson] = useState<OrganizationUser>();
  const [projectsOfPerson, setProjectsOfPerson] = useState<ProjectOfPerson[]>();

  useEffect(() => {
    const populatePeople = async () => {
      const response = await getOrganizationUsers(organization!);
      if (response.requestSucceeded) {
        const selectedUser = response.users.find((user) => user.id.toString() === personId);
        setPerson(selectedUser);
      }
    };
    if (organization) {
      populatePeople();
    }
  }, [personId, organization]);

  useEffect(() => {
    const projects = person?.projectIds.map((projectId) => {
      const found = organization?.projects?.find((project) => project.id === projectId);
      return { ...found, role: person.role } as ProjectOfPerson;
    });
    setProjectsOfPerson(projects);
  }, [person, organization?.projects]);

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

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Link id='back' to='/people' className={classes.back}>
            <Icon name='caretLeft' className={classes.backIcon} />
            {strings.PEOPLE}
          </Link>
        </Grid>
        <Grid item xs={12} className={classes.titleWithButton}>
          <h2>{person?.email}</h2>
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
