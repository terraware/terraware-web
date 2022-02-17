import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getOrganizationUsers } from 'src/api/organization/organization';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { OrganizationUser } from 'src/types/User';
import { getProjectsById } from 'src/utils/organization';
import TableCellRenderer from './TableCellRenderer';

const useStyles = makeStyles((theme) =>
  createStyles({
    main: {
      background: '#ffffff',
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
    },
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
  { key: 'firstName', name: strings.FIRST_NAME, type: 'string' },
  { key: 'lastName', name: strings.LAST_NAME, type: 'string' },
  { key: 'email', name: strings.EMAIL, type: 'string' },
  { key: 'role', name: strings.ROLE, type: 'string' },
  { key: 'projectNames', name: strings.PROJECTS, type: 'string' },
  { key: 'addedTime', name: strings.DATE_ADDED, type: 'date' },
];

type OrganizationUserWithProjectName = OrganizationUser & {
  projectNames: string[];
};

type PeopleListProps = {
  organization?: ServerOrganization;
};

export default function PeopleList({ organization }: PeopleListProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const [people, setPeople] = useState<OrganizationUserWithProjectName[]>();

  const onSelect = (selected: OrganizationUser) => {
    if (selected.id) {
      const personLocation = {
        pathname: `/people/${selected.id}`,
      };
      history.push(personLocation);
    }
  };

  useEffect(() => {
    const populatePeople = async () => {
      if (organization) {
        const response = await getOrganizationUsers(organization);
        if (response.requestSucceeded) {
          const peopleWithProjectName = addProjectsNamesToPeople(response.users);
          setPeople(peopleWithProjectName);
        }
      }
    };

    const addProjectsNamesToPeople = (users: OrganizationUser[]): OrganizationUserWithProjectName[] => {
      if (organization) {
        const allProjects = getProjectsById(organization);
        return users.map((user) => {
          const projectNamesOfPerson: string[] = user.projectIds.map((projectId) => {
            const projectName = allProjects.get(projectId)?.name;
            if (!projectName) {
              console.error(`Could not find project name associated with user id ${user.id},  project id ${projectId}`);
            }
            return projectName ? projectName : '';
          });
          return {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            id: user.id,
            role: user.role,
            projectIds: user.projectIds,
            projectNames: projectNamesOfPerson,
            addedTime: user.addedTime,
          };
        });
      }
      return [];
    };

    if (organization) {
      populatePeople();
    }
  }, [organization]);

  const goToNewPerson = () => {
    const newPersonLocation = {
      pathname: `/people/new`,
    };
    history.push(newPersonLocation);
  };

  return (
    <main className={classes.main}>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={2}>
            <h1 className={classes.title}>{strings.PEOPLE}</h1>
            <p>{strings.PEOPLE_DESCRIPTION}</p>
          </Grid>
          <Grid item xs={8} />
          <Grid item xs={2} className={classes.centered}>
            <Button id='new-person' label={strings.ADD_PERSON} onClick={goToNewPerson} size='medium' />
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.mainContent}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  {people && (
                    <Table
                      id='people-table'
                      columns={columns}
                      rows={people}
                      orderBy='name'
                      onSelect={onSelect}
                      Renderer={TableCellRenderer}
                    />
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}
