import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { getOrganizationUsers } from 'src/api/organization/organization';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import strings from 'src/strings';
import { AllOrganizationRoles, ServerOrganization } from 'src/types/Organization';
import { OrganizationUser } from 'src/types/User';
import { getProjectsById } from 'src/utils/organization';
import TableCellRenderer from './TableCellRenderer';

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
  { key: 'firstName', name: 'Frist Name', type: 'string' },
  { key: 'firstName', name: 'Frist Name', type: 'string' },
  { key: 'email', name: 'Email', type: 'string' },
  { key: 'role', name: 'Role', type: 'string' },
  { key: 'projectNames', name: 'Projects', type: 'string' },
  { key: 'addedTime', name: 'Date Added', type: 'date' },
];

type PeopleListProps = {
  organization?: ServerOrganization;
};

export default function PeopleList({ organization }: PeopleListProps): JSX.Element {
  const classes = useStyles();
  const [people, setPeople] = useState<OrganizationUserWithProjectName[]>();

  type OrganizationUserWithProjectName = {
    firstName?: string;
    lastName?: string;
    email: string;
    id: number;
    role: AllOrganizationRoles;
    projectIds: number[];
    projectNames: string[];
  };

  const onSelect = (selected: OrganizationUser) => {
    return true;
  };

  useEffect(() => {
    const populatePeople = async () => {
      if (organization) {
        const response = await getOrganizationUsers(organization);
        if (response.requestSucceeded) {
          const peopleWithProjectName = addProjectsNamesToPepole(response.users);
          setPeople(peopleWithProjectName);
        }
      }
    };

    const addProjectsNamesToPepole = (users: OrganizationUser[]): OrganizationUserWithProjectName[] => {
      if (organization) {
        const allProjects = getProjectsById(organization);
        const peopleWithProjectName = users.map((user) => {
          const projectNamesOfPerson: string[] = [];
          user.projectIds.forEach((projectId) => {
            projectNamesOfPerson.push(allProjects.get(projectId)?.name || '');
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
        return peopleWithProjectName;
      }
      return [];
    };

    if (organization) {
      populatePeople();
    }
  }, [organization]);

  return (
    <main>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={1} />
          <Grid item xs={2}>
            <h1>{strings.PEOPLE}</h1>
            <p>{strings.PEOPLE_DESCRIPTION}</p>
          </Grid>
          <Grid item xs={6} />
          <Grid item xs={2} className={classes.centered}>
            <Button
              id='new-person'
              label={strings.ADD_PERSON}
              onClick={() => {
                return true;
              }}
            />
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={1} />
          <Grid item xs={10}>
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
          <Grid item xs={1} />
        </Grid>
      </Container>
    </main>
  );
}
