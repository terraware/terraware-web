import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  deleteOrganization,
  getOrganizationUsers,
  leaveOrganization,
  listOrganizationRoles,
  UpdateOrganizationResponse,
} from 'src/api/organization/organization';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { OrganizationUser, User } from 'src/types/User';
import { getProjectsById } from 'src/utils/organization';
import TfMain from '../common/TfMain';
import TableCellRenderer from './TableCellRenderer';
import PageSnackbar from 'src/components/PageSnackbar';
import RemovePeopleDialog from './RemovePeopleModal';
import AssignNewOwnerDialog from '../MyAccount/AssignNewOwnerModal';
import DeleteOrgDialog from '../MyAccount/DeleteOrgModal';
import CannotRemovePeopleDialog from './CannotRemovePeopleModal';
import { updateOrganizationUser } from 'src/api/user/user';
import snackbarAtom from 'src/state/snackbar';
import { useSetRecoilState } from 'recoil';

const useStyles = makeStyles((theme) =>
  createStyles({
    title: {
      marginTop: 0,
      fontSize: '24px',
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
  reloadData?: () => void;
  user?: User;
};

export default function PeopleList({ organization, reloadData, user }: PeopleListProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const [people, setPeople] = useState<OrganizationUserWithProjectName[]>();
  const [selectedPeopleRows, setSelectedPeopleRows] = useState<OrganizationUser[]>([]);
  const [orgPeople, setOrgPeople] = useState<OrganizationUser[]>();
  const [removePeopleModalOpened, setRemovePeopleModalOpened] = useState(false);
  const [assignNewOwnerModalOpened, setAssignNewOwnerModalOpened] = useState(false);
  const [cannotRemovePeopleModalOpened, setCannotRemovePeopleModalOpened] = useState(false);
  const [deleteOrgModalOpened, setDeleteOrgModalOpened] = useState(false);
  const [newOwner, setNewOwner] = useState<OrganizationUser>();
  const setSnackbar = useSetRecoilState(snackbarAtom);

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
        return users.map((iUser) => {
          const projectNamesOfPerson: string[] = iUser.projectIds.map((projectId) => {
            const projectName = allProjects.get(projectId)?.name;
            if (!projectName) {
              console.error(
                `Could not find project name associated with user id ${iUser.id},  project id ${projectId}`
              );
            }
            return projectName ? projectName : '';
          });
          return {
            firstName: iUser.firstName,
            lastName: iUser.lastName,
            email: iUser.email,
            id: iUser.id,
            role: iUser.role,
            projectIds: iUser.projectIds,
            projectNames: projectNamesOfPerson,
            addedTime: iUser.addedTime,
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
      pathname: APP_PATHS.PEOPLE_NEW,
    };
    history.push(newPersonLocation);
  };

  const openDeleteOrgModal = () => {
    setDeleteOrgModalOpened(true);
    setCannotRemovePeopleModalOpened(false);
  };

  const removeSelectedPeopleFromOrg = async () => {
    if (organization) {
      if (selectedPeopleRows.length === organization?.totalUsers) {
        setCannotRemovePeopleModalOpened(true);
      } else {
        const selectedOwners = selectedPeopleRows.filter((selectedPerson) => selectedPerson.role === 'Owner');
        if (selectedOwners.length > 0) {
          const organizationRoles = await listOrganizationRoles(organization.id);
          const totalOwners = organizationRoles.roles?.find((role) => role.role === 'Owner');
          if (selectedOwners.length === totalOwners?.totalUsers) {
            setOrgPeople(
              people?.filter((person) => {
                const found = selectedPeopleRows.find((selectedPeople) => selectedPeople.id === person.id);
                if (found) {
                  return false;
                }
                return true;
              })
            );
            if (assignNewOwnerModalOpened) {
              setAssignNewOwnerModalOpened(false);
              setRemovePeopleModalOpened(true);
            } else {
              setAssignNewOwnerModalOpened(true);
            }
          } else {
            setRemovePeopleModalOpened(true);
          }
        } else {
          setRemovePeopleModalOpened(true);
        }
      }
    }
  };

  const removePeopleHandler = async () => {
    if (organization) {
      let assignNewOwnerResponse;
      if (newOwner) {
        assignNewOwnerResponse = await updateOrganizationUser(newOwner.id, organization.id, 'Owner', [], []);
      }
      const promises: Promise<UpdateOrganizationResponse>[] = [];
      if ((assignNewOwnerResponse && assignNewOwnerResponse.requestSucceeded === true) || !assignNewOwnerResponse) {
        selectedPeopleRows.forEach((person) => {
          promises.push(leaveOrganization(organization.id, person.id));
        });
      }
      const leaveOrgResponses = await Promise.all(promises);
      let allRemoved = true;

      leaveOrgResponses.forEach((resp) => {
        if (!resp.requestSucceeded) {
          allRemoved = false;
        }
      });

      if (allRemoved) {
        if (reloadData) {
          reloadData();
        }
        setSnackbar({
          type: 'toast',
          priority: 'success',
          msg: strings.CHANGES_SAVED,
        });
      } else {
        setSnackbar({
          type: 'toast',
          priority: 'critical',
          msg: strings.GENERIC_ERROR,
        });
      }
      history.push(APP_PATHS.PEOPLE);
    }
  };

  const deleteOrgHandler = async () => {
    if (organization && user) {
      let allRemoved = true;
      const otherUsers = selectedPeopleRows.filter((person) => person.id !== user.id);
      if (otherUsers.length) {
        const promises: Promise<UpdateOrganizationResponse>[] = [];
        otherUsers.forEach((person) => {
          promises.push(leaveOrganization(organization.id, person.id));
        });
        const leaveOrgResponses = await Promise.all(promises);

        leaveOrgResponses.forEach((resp) => {
          if (!resp.requestSucceeded) {
            allRemoved = false;
          }
        });
      }
      const deleteOrgResponse = await deleteOrganization(organization.id);
      if (allRemoved && deleteOrgResponse.requestSucceeded) {
        if (reloadData) {
          reloadData();
        }
        setSnackbar({
          type: 'toast',
          priority: 'success',
          msg: strings.CHANGES_SAVED,
        });
      } else {
        setSnackbar({
          type: 'toast',
          priority: 'critical',
          msg: strings.GENERIC_ERROR,
        });
      }
      history.push(APP_PATHS.HOME);
    }
  };

  return (
    <TfMain>
      {selectedPeopleRows.length > 0 && (
        <>
          <RemovePeopleDialog
            open={removePeopleModalOpened}
            onClose={() => setRemovePeopleModalOpened(false)}
            onSubmit={removePeopleHandler}
            removedPeople={selectedPeopleRows}
          />
          <AssignNewOwnerDialog
            open={assignNewOwnerModalOpened}
            onClose={() => setAssignNewOwnerModalOpened(false)}
            people={orgPeople || []}
            onSubmit={removeSelectedPeopleFromOrg}
            setNewOwner={setNewOwner}
            selectedOwner={newOwner}
          />
          <CannotRemovePeopleDialog
            open={cannotRemovePeopleModalOpened}
            onClose={() => setCannotRemovePeopleModalOpened(false)}
            onSubmit={openDeleteOrgModal}
          />
          <DeleteOrgDialog
            open={deleteOrgModalOpened}
            onClose={() => setDeleteOrgModalOpened(false)}
            onSubmit={deleteOrgHandler}
            orgName={organization?.name || ''}
          />
        </>
      )}
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <h1 className={classes.title}>{strings.PEOPLE}</h1>
          <p>{strings.PEOPLE_DESCRIPTION}</p>
        </Grid>
        <Grid item xs={6} />
        <Grid item xs={2} className={classes.centered}>
          <Button id='new-person' label={strings.ADD_PERSON} onClick={goToNewPerson} size='medium' />
        </Grid>
        <PageSnackbar />
        <Grid item xs={12}>
          <div className={classes.mainContent}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                {people && (
                  <Table
                    id='people-table'
                    columns={columns}
                    rows={people}
                    orderBy='name'
                    Renderer={TableCellRenderer}
                    showCheckbox={true}
                    selectedRows={selectedPeopleRows}
                    setSelectedRows={setSelectedPeopleRows}
                    showTopBar={true}
                    topBarButtons={[
                      {
                        buttonType: 'passive',
                        buttonText: strings.REMOVE,
                        onButtonClick: removeSelectedPeopleFromOrg,
                      },
                    ]}
                  />
                )}
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
    </TfMain>
  );
}
