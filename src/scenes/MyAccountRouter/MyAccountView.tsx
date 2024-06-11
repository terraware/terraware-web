import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, FormControlLabel, Grid, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import { Button, DropdownItem } from '@terraware/web-components';

import RegionSelector from 'src/components/RegionSelector';
import TimeZoneSelector from 'src/components/TimeZoneSelector';
import WeightSystemSelector from 'src/components/WeightSystemSelector';
import OptionsMenu from 'src/components/common/OptionsMenu';
import TextWithLink from 'src/components/common/TextWithLink';
import TfMain from 'src/components/common/TfMain';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { useDocLinks } from 'src/docLinks';
import { useLocalization, useUser } from 'src/providers';
import { useTimeZones } from 'src/providers';
import {
  LocationService,
  OrganizationService,
  OrganizationUserService,
  PreferencesService,
  UserService,
} from 'src/services';
import strings from 'src/strings';
import { findLocaleDetails, useSupportedLocales } from 'src/strings/locales';
import { Country } from 'src/types/Country';
import { Organization, roleName } from 'src/types/Organization';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { OrganizationUser, User } from 'src/types/User';
import { weightSystems } from 'src/units';
import { getCountryByCode } from 'src/utils/country';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { getUTC } from 'src/utils/useTimeZoneUtils';

import LocaleSelector from '../../components/LocaleSelector';
import Checkbox from '../../components/common/Checkbox';
import PageForm from '../../components/common/PageForm';
import PageHeaderWrapper from '../../components/common/PageHeaderWrapper';
import TextField from '../../components/common/Textfield/Textfield';
import TitleDescription from '../../components/common/TitleDescription';
import AssignNewOwnerDialog from './AssignNewOwnerModal';
import CannotRemoveOrgDialog from './CannotRemoveOrgModal';
import DeleteAccountModal from './DeleteAccountModal';
import DeleteOrgDialog from './DeleteOrgModal';
import LeaveOrganizationDialog from './LeaveOrganizationModal';

type MyAccountProps = {
  className?: string;
  edit: boolean;
  hasNav?: boolean;
  organizations?: Organization[];
  reloadData?: () => void;
};

export default function MyAccountView(props: MyAccountProps): JSX.Element | null {
  const { user, reloadUser } = useUser();

  if (!user) {
    return null;
  }

  return <MyAccountContent user={{ ...user }} reloadUser={reloadUser} {...props} />;
}

type MyAccountContentProps = {
  style?: CSSProperties;
  edit: boolean;
  hasNav?: boolean;
  organizations?: Organization[];
  reloadData?: () => void;
  reloadUser: () => void;
  user: User;
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
  { key: 'totalUsers', name: strings.PEOPLE, type: 'number' },
  { key: 'roleName', name: strings.ROLE, type: 'string' },
];

const MyAccountContent = ({
  style,
  edit,
  hasNav,
  organizations,
  reloadData,
  reloadUser,
  user,
}: MyAccountContentProps): JSX.Element => {
  const { isMobile } = useDeviceInfo();
  const supportedLocales = useSupportedLocales();
  const theme = useTheme();
  const [selectedRows, setSelectedRows] = useState<PersonOrganization[]>([]);
  const [personOrganizations, setPersonOrganizations] = useState<PersonOrganization[]>([]);
  const navigate = useNavigate();
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
  const docLinks = useDocLinks();
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
    onChange('cookiesConsented', user.cookiesConsented);
    navigate(APP_PATHS.MY_ACCOUNT);
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
      navigate(APP_PATHS.MY_ACCOUNT);
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
    navigate(APP_PATHS.MY_ACCOUNT);
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
      navigate(APP_PATHS.HOME);
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
    <TfMain style={style}>
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
        <PageHeaderWrapper nextElement={contentRef.current} hasNav={hasNav}>
          <Box
            display='flex'
            justifyContent='space-between'
            marginBottom={theme.spacing(4)}
            padding={hasNav === false ? theme.spacing(0, 5) : theme.spacing(0, 0, 0, 3)}
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
                  onClick={() => navigate(APP_PATHS.MY_ACCOUNT_EDIT)}
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
            borderRadius: '32px',
            margin: theme.spacing(0, hasNav === false ? 4 : 0),
            padding: theme.spacing(3),
          }}
        >
          <Box sx={isMobile ? { width: 'calc(100vw - 72px)' } : {}}>
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
              <Grid item xs={12}>
                <Typography fontSize='20px' fontWeight={600} marginBottom={theme.spacing(1.5)}>
                  {strings.COOKIES}
                </Typography>
                <RadioGroup
                  name='radio-buttons-cookies-consent'
                  onChange={(_event, value) => onChange('cookiesConsented', value)}
                  value={record.cookiesConsented}
                >
                  <Grid item xs={12} textAlign='left' display='flex' flexDirection='row'>
                    <FormControlLabel
                      control={<Radio />}
                      disabled={!edit}
                      label={strings.COOKIES_ACCEPT}
                      value={true}
                    />
                    <FormControlLabel
                      control={<Radio />}
                      disabled={!edit}
                      label={strings.COOKIES_DECLINE}
                      value={false}
                    />
                  </Grid>
                </RadioGroup>
                <Typography>{strings.COOKIES_DESCRIPTION}</Typography>
                <TextWithLink href={docLinks.cookie_policy} isExternal text={strings.COOKIES_LEARN_MORE} />
              </Grid>
            </Grid>
          </Box>
          {organizations && organizations.length > 0 ? (
            <Grid container spacing={4}>
              <Grid item xs={12} />
              <Grid item xs={12}>
                <Typography fontSize='20px' fontWeight={600}>
                  {strings.ORGANIZATIONS}
                </Typography>
              </Grid>
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
          ) : null}
        </Box>
      </PageForm>
    </TfMain>
  );
};
