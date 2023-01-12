import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { updateOrganizationUser, updateUserProfile } from 'src/api/user/user';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { OrganizationUser, User } from 'src/types/User';
import useForm from 'src/utils/useForm';
import PageForm from '../common/PageForm';
import TextField from '../common/Textfield/Textfield';
import AssignNewOwnerDialog from './AssignNewOwnerModal';
import { getOrganizationUsers, leaveOrganization, listOrganizationRoles } from 'src/api/organization/organization';
import LeaveOrganizationDialog from './LeaveOrganizationModal';
import CannotRemoveOrgDialog from './CannotRemoveOrgModal';
import DeleteOrgDialog from './DeleteOrgModal';
import { deleteOrganization } from '../../api/organization/organization';
import Checkbox from '../common/Checkbox';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';
import TfMain from 'src/components/common/TfMain';
import PageHeaderWrapper from '../common/PageHeaderWrapper';
import TitleDescription from '../common/TitleDescription';
import { useUser } from 'src/providers';
import TimeZoneSelector from 'src/components/TimeZoneSelector';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { useTimeZones } from 'src/providers';
import { getUTC } from 'src/utils/useTimeZoneUtils';
import isEnabled from 'src/features';

const columns: TableColumnType[] = [
  { key: 'name', name: strings.ORGANIZATION_NAME, type: 'string' },
  { key: 'description', name: strings.DESCRIPTION, type: 'string' },
  { key: 'totalUsers', name: strings.PEOPLE, type: 'string' },
  { key: 'role', name: strings.ROLE, type: 'string' },
];

type MyAccountProps = {
  organizations?: ServerOrganization[];
  edit: boolean;
  reloadData?: () => void;
};

export default function MyAccount(props: MyAccountProps): JSX.Element | null {
  const { user, reloadUser } = useUser();

  if (!user) {
    return null;
  }

  return <MyAccountContent user={{ ...user }} reloadUser={reloadUser} {...props} />;
}

type MyAccountContentProps = {
  user: User;
  organizations?: ServerOrganization[];
  edit: boolean;
  reloadUser: () => void;
  reloadData?: () => void;
};

const MyAccountContent = ({
  user,
  organizations,
  edit,
  reloadUser,
  reloadData,
}: MyAccountContentProps): JSX.Element => {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const [selectedRows, setSelectedRows] = useState<ServerOrganization[]>([]);
  const [personOrganizations, setPersonOrganizations] = useState<ServerOrganization[]>([]);
  const history = useHistory();
  const [record, setRecord, onChange] = useForm<User>(user);
  const [removedOrg, setRemovedOrg] = useState<ServerOrganization>();
  const [leaveOrganizationModalOpened, setLeaveOrganizationModalOpened] = useState(false);
  const [assignNewOwnerModalOpened, setAssignNewOwnerModalOpened] = useState(false);
  const [cannotRemoveOrgModalOpened, setCannotRemoveOrgModalOpened] = useState(false);
  const [deleteOrgModalOpened, setDeleteOrgModalOpened] = useState(false);
  const [newOwner, setNewOwner] = useState<OrganizationUser>();
  const [orgPeople, setOrgPeople] = useState<OrganizationUser[]>();
  const snackbar = useSnackbar();
  const contentRef = useRef(null);
  const timeZonesEnabled = isEnabled('Timezones');
  const timeZones = useTimeZones();
  const tz = timeZones.find((timeZone) => timeZone.id === record.timeZone) || getUTC(timeZones);

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
        snackbar.toastError(strings.REMOVE_ONLY_ONE_ORG_AT_A_TIME);
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
        snackbar.toastSuccess(strings.CHANGES_SAVED);
      } else {
        snackbar.toastError();
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
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    } else {
      snackbar.toastError();
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
        snackbar.toastSuccess(strings.CHANGES_SAVED);
      } else {
        snackbar.toastError();
      }
      history.push(APP_PATHS.HOME);
    }
  };

  const onTimeZoneChange = (value: TimeZoneDescription) => {
    if (value?.id) {
      setRecord((previousRecord: User): User => {
        return {
          ...previousRecord,
          timeZone: value.id,
        };
      });
    }
  };

  return (
    <TfMain>
      <PageForm
        cancelID='cancelAccountChange'
        saveID='saveAccountChange'
        onCancel={onCancel}
        onSave={saveChanges}
        hideEdit={!edit}
      >
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
        <PageHeaderWrapper nextElement={contentRef.current}>
          <Box
            display='flex'
            justifyContent='space-between'
            marginBottom={theme.spacing(4)}
            paddingLeft={theme.spacing(3)}
            marginTop={organizations && organizations.length > 0 ? 0 : theme.spacing(12)}
          >
            <TitleDescription title={strings.MY_ACCOUNT} description={strings.MY_ACCOUNT_DESC} style={{ padding: 0 }} />
            <Button
              id='edit-account'
              icon='iconEdit'
              label={isMobile ? '' : strings.EDIT_ACCOUNT}
              onClick={() => history.push(APP_PATHS.MY_ACCOUNT_EDIT)}
              size='medium'
              priority='primary'
            />
          </Box>
        </PageHeaderWrapper>
        <Box
          ref={contentRef}
          sx={{
            backgroundColor: theme.palette.TwClrBg,
            padding: theme.spacing(3),
            borderRadius: '32px',
            minWidth: 'fit-content',
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography fontSize='20px' fontWeight={600}>
                {strings.GENERAL}
              </Typography>
            </Grid>
            <Grid item xs={isMobile ? 12 : 4}>
              <TextField
                label={strings.FIRST_NAME}
                id='firstName'
                type='text'
                value={record.firstName}
                display={!edit}
                onChange={(value) => onChange('firstName', value)}
              />
            </Grid>
            <Grid item xs={isMobile ? 12 : 4}>
              <TextField
                label={strings.LAST_NAME}
                id='lastName'
                type='text'
                value={record.lastName}
                display={!edit}
                onChange={(value) => onChange('lastName', value)}
              />
            </Grid>
            <Grid item xs={isMobile ? 12 : 4}>
              <TextField
                label={strings.EMAIL}
                id='email'
                type='text'
                value={record.email}
                display={!edit}
                readonly={true}
              />
            </Grid>
            <Grid item xs={12} />
            {timeZonesEnabled && (
              <>
                <Grid item xs={12}>
                  <Typography fontSize='20px' fontWeight={600}>
                    {strings.TIME_ZONE}
                  </Typography>
                </Grid>
                <Grid xs={12} marginLeft={3}>
                  {edit ? (
                    <TimeZoneSelector
                      onTimeZoneSelected={onTimeZoneChange}
                      selectedTimeZone={record.timeZone}
                      disabled={!edit}
                      tooltip={strings.MY_ACCOUNT_TIME_ZONE_TOOLTIP}
                    />
                  ) : (
                    <TextField
                      label=''
                      id='timezone'
                      type='text'
                      value={tz.longName}
                      tooltipTitle={record.timeZone ? '' : strings.DEFAULT_TIME_ZONE_TOOLTIP}
                      display={true}
                    />
                  )}
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <Typography fontSize='20px' fontWeight={600} marginBottom={theme.spacing(1.5)}>
                {strings.NOTIFICATIONS}
              </Typography>
              <Typography fontSize='14px'>{strings.MY_ACCOUNT_NOTIFICATIONS_DESC}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Checkbox
                disabled={!edit}
                id='emailNotificationsEnabled'
                name={strings.RECEIVE_EMAIL_NOTIFICATIONS}
                label={strings.RECEIVE_EMAIL_NOTIFICATIONS}
                value={record.emailNotificationsEnabled}
                onChange={(value) => onChange('emailNotificationsEnabled', value)}
              />
            </Grid>
            <Grid item xs={12} />
            {organizations && organizations.length > 0 ? (
              <>
                <Grid item xs={12}>
                  <Typography fontSize='20px' fontWeight={600}>
                    {strings.ORGANIZATIONS}
                  </Typography>
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
                              {
                                buttonType: 'destructive',
                                buttonText: strings.REMOVE,
                                onButtonClick: removeSelectedOrgs,
                              },
                            ]}
                          />
                        )}
                      </Grid>
                    </Grid>
                  </div>
                </Grid>
              </>
            ) : null}
          </Grid>
        </Box>
      </PageForm>
    </TfMain>
  );
};
