import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { updateOrganizationUser, updateUserProfile } from 'src/api/user/user';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import dictionary from 'src/strings/dictionary';
import { ServerOrganization } from 'src/types/Organization';
import { OrganizationUser, User } from 'src/types/User';
import useForm from 'src/utils/useForm';
import FormBottomBar from '../common/FormBottomBar';
import TextField from '../common/Textfield/Textfield';
import TfDivisor from '../common/TfDivisor';
import TfMain from '../common/TfMain';
import snackbarAtom from 'src/state/snackbar';
import AssignNewOwnerDialog from './AssignNewOwnerModal';
import { getOrganizationUsers, leaveOrganization, listOrganizationRoles } from 'src/api/organization/organization';
import LeaveOrganizationDialog from './LeaveOrganizationModal';
import CannotRemoveOrgDialog from './CannotRemoveOrgModal';
import DeleteOrgDialog from './DeleteOrgModal';
import { deleteOrganization } from '../../api/organization/organization';
import Checkbox from '../common/Checkbox';

const useStyles = makeStyles((theme) =>
  createStyles({
    title: {
      marginTop: 0,
      fontSize: '24px',
    },
    centered: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    organizationsHeading: {
      marginBottom: 0,
    },
    editContainer: {
      marginBottom: `${theme.spacing(8)}px`,
    },
  })
);

const columns: TableColumnType[] = [
  { key: 'name', name: strings.ORGANIZATION_NAME, type: 'string' },
  { key: 'description', name: strings.DESCRIPTION, type: 'string' },
  { key: 'totalUsers', name: strings.PEOPLE, type: 'string' },
];

type MyAccountProps = {
  user: User;
  organizations?: ServerOrganization[];
  edit: boolean;
  reloadUser: () => void;
  reloadData?: () => void;
};

export default function MyAccount({ user, organizations, edit, reloadUser, reloadData }: MyAccountProps): JSX.Element {
  const classes = useStyles();
  const [selectedRows, setSelectedRows] = useState<ServerOrganization[]>([]);
  const [personOrganizations, setPersonOrganizations] = useState<ServerOrganization[]>([]);
  const history = useHistory();
  const [record, setRecord, onChange] = useForm<User>(user);
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const [removedOrg, setRemovedOrg] = useState<ServerOrganization>();
  const [leaveOrganizationModalOpened, setLeaveOrganizationModalOpened] = useState(false);
  const [assignNewOwnerModalOpened, setAssignNewOwnerModalOpened] = useState(false);
  const [cannotRemoveOrgModalOpened, setCannotRemoveOrgModalOpened] = useState(false);
  const [deleteOrgModalOpened, setDeleteOrgModalOpened] = useState(false);
  const [newOwner, setNewOwner] = useState<OrganizationUser>();
  const [orgPeople, setOrgPeople] = useState<OrganizationUser[]>();

  useEffect(() => {
    if (organizations) {
      setPersonOrganizations(organizations);
    }
  }, [organizations]);

  useEffect(() => {
    setRecord(user);
  }, [user, setRecord]);

  useEffect(() => {
    const populatePeople = async () => {
      if (removedOrg) {
        const response = await getOrganizationUsers(removedOrg);
        if (response.requestSucceeded) {
          const otherUsers = response.users.filter((orgUser) => orgUser.id !== user.id);
          setOrgPeople(otherUsers);
        }
      }
    };
    populatePeople();
  }, [removedOrg, user.id]);

  const removeSelectedOrgs = () => {
    if (organizations && personOrganizations) {
      if (selectedRows.length > 1 || organizations.length - personOrganizations.length === 1) {
        setSnackbar({
          type: 'toast',
          priority: 'critical',
          msg: strings.REMOVE_ONLY_ONE_ORG_AT_A_TIME,
        });
      } else {
        setRemovedOrg(selectedRows[0]);
        setPersonOrganizations((currentPersonOrganizations) => {
          const selectedRowsIds = selectedRows.map((sr) => sr.id);
          return currentPersonOrganizations?.filter((org) => !selectedRowsIds?.includes(org.id));
        });
      }
    }
  };

  const onCancel = () => {
    if (organizations) {
      setPersonOrganizations(organizations);
    }
    setRemovedOrg(undefined);
    setSelectedRows([]);
    history.push(APP_PATHS.MY_ACCOUNT);
  };

  const saveChanges = async () => {
    if (removedOrg) {
      if (removedOrg.role !== 'Owner') {
        setLeaveOrganizationModalOpened(true);
      } else if (assignNewOwnerModalOpened) {
        setAssignNewOwnerModalOpened(false);
        setLeaveOrganizationModalOpened(true);
      } else if (removedOrg.totalUsers > 1) {
        const organizationRoles = listOrganizationRoles(removedOrg.id);
        const owners = (await organizationRoles).roles?.find((role) => role.role === 'Owner');
        if (owners?.totalUsers === 1) {
          setAssignNewOwnerModalOpened(true);
        } else {
          setLeaveOrganizationModalOpened(true);
        }
      } else {
        setCannotRemoveOrgModalOpened(true);
      }
    } else {
      const updateUserResponse = await saveProfileChanges();
      if (updateUserResponse.requestSucceeded) {
        reloadUser();
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
      history.push(APP_PATHS.MY_ACCOUNT);
    }
  };

  const saveProfileChanges = async () => {
    const updateUserResponse = await updateUserProfile(record);
    return updateUserResponse;
  };

  const openDeleteOrgModal = () => {
    setDeleteOrgModalOpened(true);
    setCannotRemoveOrgModalOpened(false);
  };

  const leaveOrgHandler = async () => {
    const updateUserResponse = await saveProfileChanges();
    let leaveOrgResponse = {
      requestSucceeded: true,
    };
    if (removedOrg) {
      let assignNewOwnerResponse;
      if (newOwner) {
        assignNewOwnerResponse = await updateOrganizationUser(newOwner.id, removedOrg.id, 'Owner');
      }
      if ((assignNewOwnerResponse && assignNewOwnerResponse.requestSucceeded === true) || !assignNewOwnerResponse) {
        leaveOrgResponse = await leaveOrganization(removedOrg.id, user.id);
      }
    }
    if (updateUserResponse.requestSucceeded && leaveOrgResponse.requestSucceeded) {
      if (reloadData) {
        reloadData();
      }
      reloadUser();
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
    setLeaveOrganizationModalOpened(false);
    history.push(APP_PATHS.MY_ACCOUNT);
  };

  const deleteOrgHandler = async () => {
    if (removedOrg) {
      const deleterOrgReponse = await deleteOrganization(removedOrg.id);
      const updateUserResponse = await saveProfileChanges();
      if (updateUserResponse.requestSucceeded && deleterOrgReponse.requestSucceeded) {
        if (reloadData) {
          reloadData();
        }
        reloadUser();
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
    <>
      {removedOrg && (
        <>
          <LeaveOrganizationDialog
            open={leaveOrganizationModalOpened}
            onClose={() => setLeaveOrganizationModalOpened(false)}
            onSubmit={leaveOrgHandler}
            orgName={removedOrg.name}
          />
          <AssignNewOwnerDialog
            open={assignNewOwnerModalOpened}
            onClose={() => setAssignNewOwnerModalOpened(false)}
            people={orgPeople || []}
            onSubmit={saveChanges}
            setNewOwner={setNewOwner}
            selectedOwner={newOwner}
          />
          <CannotRemoveOrgDialog
            open={cannotRemoveOrgModalOpened}
            onClose={() => setCannotRemoveOrgModalOpened(false)}
            onSubmit={openDeleteOrgModal}
          />
          <DeleteOrgDialog
            open={deleteOrgModalOpened}
            onClose={() => setDeleteOrgModalOpened(false)}
            orgName={removedOrg.name}
            onSubmit={deleteOrgHandler}
          />
        </>
      )}
      <TfMain>
        <Grid container spacing={3} className={edit ? classes.editContainer : ''}>
          <Grid item xs={4}>
            <h1 className={classes.title}>{strings.MY_ACCOUNT}</h1>
            <p>{strings.MY_ACCOUNT_DESC}</p>
          </Grid>
          <Grid item xs={6} />
          <Grid item xs={2} className={classes.centered}>
            <Button
              id='edit-account'
              label={dictionary.EDIT_ACCOUNT}
              onClick={() => history.push(APP_PATHS.MY_ACCOUNT_EDIT)}
              size='medium'
              priority='secondary'
            />
          </Grid>
          <Grid item xs={12}>
            <h2>{dictionary.GENERAL}</h2>
          </Grid>
          <Grid item xs={4}>
            <TextField
              label={strings.FIRST_NAME}
              id='firstName'
              type='text'
              value={record.firstName}
              display={!edit}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label={strings.LAST_NAME}
              id='lastName'
              type='text'
              value={record.lastName}
              display={!edit}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label={strings.EMAIL}
              id='email'
              type='text'
              value={record.email}
              display={!edit}
              readonly={true}
            />
          </Grid>
          <Grid item xs={12}>
            <TfDivisor />
          </Grid>
          <Grid item xs={12}>
            <h2>{dictionary.NOTIFICATIONS}</h2>
            <p>{strings.MY_ACCOUNT_NOTIFICATIONS_DESC}</p>
          </Grid>
          <Grid item xs={4}>
            <Checkbox
              disabled={!edit}
              id='emailNotificationsEnabled'
              name={strings.RECEIVE_EMAIL_NOTIFICATIONS}
              label={strings.RECEIVE_EMAIL_NOTIFICATIONS}
              value={record.emailNotificationsEnabled}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TfDivisor />
          </Grid>
          <Grid item xs={12}>
            <h2 className={classes.organizationsHeading}>{dictionary.ORGANIZATIONS}</h2>
          </Grid>
          <Grid item xs={12}>
            <div>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  {organizations && (
                    <Table
                      id='organizations-table'
                      columns={columns}
                      rows={personOrganizations}
                      orderBy='name'
                      selectedRows={selectedRows}
                      setSelectedRows={setSelectedRows}
                      showCheckbox={edit}
                      showTopBar={edit}
                      topBarButtons={[
                        { buttonType: 'destructive', buttonText: strings.REMOVE, onButtonClick: removeSelectedOrgs },
                      ]}
                    />
                  )}
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </TfMain>
      {edit && <FormBottomBar onCancel={onCancel} onSave={saveChanges} />}
    </>
  );
}
