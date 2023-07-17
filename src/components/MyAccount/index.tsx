import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, DropdownItem } from '@terraware/web-components';
import {
  OrganizationUserService,
  OrganizationService,
  PreferencesService,
  UserService,
  LocationService,
} from 'src/services';
import Table from 'src/components/common/table';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { roleName, Organization } from 'src/types/Organization';
import { OrganizationUser, User } from 'src/types/User';
import useForm from 'src/utils/useForm';
import PageForm from '../common/PageForm';
import TextField from '../common/Textfield/Textfield';
import AssignNewOwnerDialog from './AssignNewOwnerModal';
import LeaveOrganizationDialog from './LeaveOrganizationModal';
import CannotRemoveOrgDialog from './CannotRemoveOrgModal';
import DeleteOrgDialog from './DeleteOrgModal';
import Checkbox from '../common/Checkbox';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';
import TfMain from 'src/components/common/TfMain';
import PageHeaderWrapper from '../common/PageHeaderWrapper';
import TitleDescription from '../common/TitleDescription';
import { useLocalization, useUser } from 'src/providers';
import TimeZoneSelector from 'src/components/TimeZoneSelector';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { useTimeZones } from 'src/providers';
import { getUTC } from 'src/utils/useTimeZoneUtils';
import { weightSystems } from 'src/units';
import WeightSystemSelector from 'src/components/WeightSystemSelector';
import LocaleSelector from '../LocaleSelector';
import { findLocaleDetails, useSupportedLocales } from 'src/strings/locales';
import DeleteAccountModal from './DeleteAccountModal';
import { Country } from 'src/types/Country';
import { getCountryByCode } from 'src/utils/country';
import RegionSelector from 'src/components/RegionSelector';

type MyAccountProps = {
  organizations?: Organization[];
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
  organizations?: Organization[];
  edit: boolean;
  reloadUser: () => void;
  reloadData?: () => void;
};

/**
 * Details of membership in an organization, with an additional property for the localized name
 * of the user's role.
 */
type PersonOrganization = Organization & { roleName: string };

function addRoleName(organization: Organization): PersonOrganization {
  return { ...organization, roleName: roleName(organization.role) };
}

function addRoleNames(organizations: Organization[]): PersonOrganization[] {
  return organizations.map(addRoleName);
}

const columns = (): TableColumnType[] => [
  { key: 'name', name: strings.ORGANIZATION_NAME, type: 'string' },
  { key: 'description', name: strings.DESCRIPTION, type: 'string' },
  { key: 'totalUsers', name: strings.PEOPLE, type: 'string' },
  { key: 'roleName', name: strings.ROLE, type: 'string' },
];

const MyAccountContent = ({
  user,
  organizations,
  edit,
  reloadUser,
  reloadData,
}: MyAccountContentProps): JSX.Element => {
  const { isMobile } = useDeviceInfo();
  const supportedLocales = useSupportedLocales();
  const theme = useTheme();
  const [selectedRows, setSelectedRows] = useState<PersonOrganization[]>([]);
  const [personOrganizations, setPersonOrganizations] = useState<PersonOrganization[]>([]);
  const history = useHistory();
  const [record, setRecord, onChange] = useForm<User>(user);
  const [openDeleteAccountModal, setOpenDeleteAccountModal] = useState<boolean>(false);
  const [removedOrg, setRemovedOrg] = useState<Organization>();
  const [leaveOrganizationModalOpened, setLeaveOrganizationModalOpened] = useState(false);
  const [assignNewOwnerModalOpened, setAssignNewOwnerModalOpened] = useState(false);
  const [cannotRemoveOrgModalOpened, setCannotRemoveOrgModalOpened] = useState(false);
  const [deleteOrgModalOpened, setDeleteOrgModalOpened] = useState(false);
  const [newOwner, setNewOwner] = useState<OrganizationUser>();
  const [orgPeople, setOrgPeople] = useState<OrganizationUser[]>();
  const { userPreferences, reloadUserPreferences } = useUser();
  const snackbar = useSnackbar();
  const contentRef = useRef(null);
  const { activeLocale, selectedLocale, setSelectedLocale } = useLocalization();
  const [countries, setCountries] = useState<Country[]>();
  const timeZones = useTimeZones();
  const tz = timeZones.find((timeZone) => timeZone.id === record.timeZone) || getUTC(timeZones);
  const [preferredWeightSystemSelected, setPreferredWeightSystemSelected] = useState(
    (userPreferences?.preferredWeightSystem as string) || 'metric'
  );
  const loadedStringsForLocale = useLocalization().activeLocale;

  const [localeSelected, setLocaleSelected] = useState(selectedLocale);
  const [countryCodeSelected, setCountryCodeSelected] = useState(user?.countryCode);

  useEffect(() => {
    setLocaleSelected(selectedLocale);
  }, [selectedLocale]);

  useEffect(() => {
    if (organizations && loadedStringsForLocale) {
      setPersonOrganizations(addRoleNames(organizations));
    }
  }, [organizations, loadedStringsForLocale]);

  useEffect(() => {
    if (userPreferences?.preferredWeightSystem) {
      setPreferredWeightSystemSelected(userPreferences.preferredWeightSystem as string);
    }
  }, [userPreferences]);

  useEffect(() => {
    setRecord(user);
    if (!countryCodeSelected) {
      setCountryCodeSelected(user.countryCode);
    }
  }, [user, setRecord, countryCodeSelected, setCountryCodeSelected]);

  useEffect(() => {
    if (activeLocale) {
      const populateCountries = async () => {
        const response = await LocationService.getCountries();
        if (response) {
          setCountries(response);
        }
      };

      populateCountries();
    }
  }, [activeLocale]);

  useEffect(() => {
    const populatePeople = async () => {
      if (removedOrg) {
        const response = await OrganizationUserService.getOrganizationUsers(removedOrg.id);
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
      setPersonOrganizations(addRoleNames(organizations));
    }
    setRemovedOrg(undefined);
    setPreferredWeightSystemSelected((userPreferences?.preferredWeightSystem as string) || 'metric');
    setLocaleSelected(selectedLocale);
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
        const organizationRoles = OrganizationService.getOrganizationRoles(removedOrg.id);
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
      await PreferencesService.updateUserPreferences({ preferredWeightSystem: preferredWeightSystemSelected });
      reloadUserPreferences();

      const lastLocale = selectedLocale;
      setSelectedLocale(localeSelected);
      const updateUserResponse = await saveProfileChanges();
      if (updateUserResponse.requestSucceeded) {
        reloadUser();
        snackbar.toastSuccess(strings.CHANGES_SAVED);
      } else {
        setSelectedLocale(lastLocale);
        snackbar.toastError();
      }
      history.push(APP_PATHS.MY_ACCOUNT);
    }
  };

  const saveProfileChanges = async () => {
    // Save the currently-selected locale, even if it differs from the locale in the profile data we
    // fetched from the server.
    const updateUserResponse = await UserService.updateUser({
      ...record,
      countryCode: countryCodeSelected,
      locale: localeSelected,
    });
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
        assignNewOwnerResponse = await OrganizationUserService.updateOrganizationUser(
          removedOrg.id,
          newOwner.id,
          'Owner'
        );
      }
      if ((assignNewOwnerResponse && assignNewOwnerResponse.requestSucceeded === true) || !assignNewOwnerResponse) {
        leaveOrgResponse = await OrganizationUserService.deleteOrganizationUser(removedOrg.id, user.id);
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
      const deleterOrgReponse = await OrganizationService.deleteOrganization(removedOrg.id);
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

  const onOptionItemClick = (optionItem: DropdownItem) => {
    if (optionItem.value === 'delete-account') {
      setOpenDeleteAccountModal(true);
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
            {!edit && (
              <Box display='flex' height='fit-content'>
                {openDeleteAccountModal && <DeleteAccountModal onCancel={() => setOpenDeleteAccountModal(false)} />}
                <Button
                  id='edit-account'
                  icon='iconEdit'
                  label={isMobile ? '' : strings.EDIT_ACCOUNT}
                  onClick={() => history.push(APP_PATHS.MY_ACCOUNT_EDIT)}
                  size='medium'
                  priority='primary'
                />
                <OptionsMenu
                  onOptionItemClick={onOptionItemClick}
                  optionItems={[{ label: strings.DELETE_ACCOUNT, value: 'delete-account', type: 'destructive' }]}
                />
              </Box>
            )}
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
            <Grid item xs={12}>
              <Typography fontSize='20px' fontWeight={600}>
                {strings.LANGUAGE_AND_REGION}
              </Typography>
            </Grid>
            <Grid
              item
              xs={isMobile ? 12 : 3}
              sx={{ '&.MuiGrid-item': { paddingTop: theme.spacing(isMobile ? 3 : 2) } }}
            >
              {edit ? (
                <LocaleSelector
                  onChangeLocale={(newValue) => setLocaleSelected(newValue)}
                  localeSelected={localeSelected}
                  fullWidth={true}
                />
              ) : (
                <TextField
                  label={strings.LANGUAGE}
                  id='locale'
                  type='text'
                  value={findLocaleDetails(supportedLocales, selectedLocale).name}
                  display={true}
                />
              )}
            </Grid>
            <Grid
              item
              xs={isMobile ? 12 : 3}
              sx={{ '&.MuiGrid-item': { paddingTop: theme.spacing(isMobile ? 3 : 2) } }}
            >
              {edit ? (
                <RegionSelector
                  selectedCountryCode={countryCodeSelected}
                  onChangeCountryCode={setCountryCodeSelected}
                  hideCountrySubdivisions={true}
                  countryLabel={strings.COUNTRY}
                  countryTooltip={strings.TOOLTIP_COUNTRY_MY_ACCOUNT}
                />
              ) : (
                <TextField
                  label={strings.COUNTRY}
                  id='country'
                  type='text'
                  value={countries && user.countryCode ? getCountryByCode(countries, user.countryCode)?.name : ''}
                  display={true}
                />
              )}
            </Grid>
            <Grid
              item
              xs={isMobile ? 12 : 3}
              sx={{ '&.MuiGrid-item': { paddingTop: theme.spacing(isMobile ? 3 : 2) } }}
            >
              {edit ? (
                <WeightSystemSelector
                  onChange={(newValue) => setPreferredWeightSystemSelected(newValue)}
                  selectedWeightSystem={preferredWeightSystemSelected}
                  fullWidth={true}
                />
              ) : (
                <TextField
                  label={strings.PREFERRED_WEIGHT_SYSTEM}
                  id='preferredWeightSystem'
                  type='text'
                  value={weightSystems().find((ws) => ws.value === preferredWeightSystemSelected)?.label}
                  display={true}
                />
              )}
            </Grid>
            <Grid item xs={isMobile ? 12 : 3} sx={{ '&.MuiGrid-item': { paddingTop: theme.spacing(2) } }}>
              {edit ? (
                <TimeZoneSelector
                  onTimeZoneSelected={onTimeZoneChange}
                  selectedTimeZone={record.timeZone}
                  tooltip={strings.TOOLTIP_TIME_ZONE_MY_ACCOUNT}
                  label={strings.TIME_ZONE}
                />
              ) : (
                <TextField
                  label={strings.TIME_ZONE}
                  id='timezone'
                  type='text'
                  value={tz.longName}
                  tooltipTitle={strings.TOOLTIP_TIME_ZONE_MY_ACCOUNT}
                  display={true}
                />
              )}
            </Grid>
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
