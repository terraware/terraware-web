import React, { useEffect, useRef, useState } from 'react';
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
import TfMain from '../common/TfMain';
import TableCellRenderer from './TableCellRenderer';
import PageSnackbar from 'src/components/PageSnackbar';
import RemovePeopleDialog from './RemovePeopleModal';
import AssignNewOwnerDialog from '../MyAccount/AssignNewOwnerModal';
import DeleteOrgDialog from '../MyAccount/DeleteOrgModal';
import CannotRemovePeopleDialog from './CannotRemovePeopleModal';
import { updateOrganizationUser } from 'src/api/user/user';
import { Grid, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';
import PageHeaderWrapper from '../common/PageHeaderWrapper';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
  },
  mainContent: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.TwClrBg,
    borderRadius: '32px',
    minWidth: 'fit-content',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
}));

const columns: TableColumnType[] = [
  { key: 'firstName', name: strings.FIRST_NAME, type: 'string' },
  { key: 'lastName', name: strings.LAST_NAME, type: 'string' },
  { key: 'email', name: strings.EMAIL, type: 'string' },
  { key: 'role', name: strings.ROLE, type: 'string' },
  { key: 'addedTime', name: strings.DATE_ADDED, type: 'date' },
];

type PeopleListProps = {
  organization?: ServerOrganization;
  reloadData?: () => void;
  user?: User;
};

export default function PeopleList({ organization, reloadData, user }: PeopleListProps): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const [people, setPeople] = useState<OrganizationUser[]>();
  const [selectedPeopleRows, setSelectedPeopleRows] = useState<OrganizationUser[]>([]);
  const [orgPeople, setOrgPeople] = useState<OrganizationUser[]>();
  const [removePeopleModalOpened, setRemovePeopleModalOpened] = useState(false);
  const [assignNewOwnerModalOpened, setAssignNewOwnerModalOpened] = useState(false);
  const [cannotRemovePeopleModalOpened, setCannotRemovePeopleModalOpened] = useState(false);
  const [deleteOrgModalOpened, setDeleteOrgModalOpened] = useState(false);
  const [newOwner, setNewOwner] = useState<OrganizationUser>();
  const snackbar = useSnackbar();
  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);

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
        assignNewOwnerResponse = await updateOrganizationUser(newOwner.id, organization.id, 'Owner');
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
        setRemovePeopleModalOpened(false);
        setSelectedPeopleRows([]);
        if (reloadData) {
          reloadData();
        }
        snackbar.toastSuccess(strings.CHANGES_SAVED);
      } else {
        snackbar.toastError();
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
        snackbar.toastSuccess(strings.CHANGES_SAVED);
      } else {
        snackbar.toastError();
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
      <PageHeaderWrapper nextElement={contentRef.current} nextElementInitialMargin={-24}>
        <Grid container paddingBottom={theme.spacing(4)} paddingLeft={isMobile ? 0 : theme.spacing(3)}>
          <Grid item xs={8}>
            <h1 className={classes.title}>{strings.PEOPLE}</h1>
          </Grid>
          <Grid item xs={4} className={classes.centered}>
            {isMobile ? (
              <Button id='new-person' icon='plus' onClick={goToNewPerson} size='medium' />
            ) : (
              <Button id='new-person' label={strings.ADD_PERSON} icon='plus' onClick={goToNewPerson} size='medium' />
            )}
          </Grid>
          <PageSnackbar />
        </Grid>
      </PageHeaderWrapper>
      <Grid container spacing={3} ref={contentRef}>
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
                        ...(!isMobile && { buttonText: strings.REMOVE }),
                        onButtonClick: removeSelectedPeopleFromOrg,
                        icon: 'iconTrashCan',
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
