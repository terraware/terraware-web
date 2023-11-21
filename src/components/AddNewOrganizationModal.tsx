import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Checkbox, Dropdown } from '@terraware/web-components';
import { OrganizationService } from 'src/services';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import {
  ManagedLocationType,
  ManagedLocationTypes,
  Organization,
  OrganizationType,
  OrganizationTypes,
  managedLocationTypeLabel,
  organizationTypeLabel,
} from 'src/types/Organization';
import useForm from 'src/utils/useForm';
import TextField from './common/Textfield/Textfield';
import { APP_PATHS } from '../constants';
import DialogBox from './common/ScrollableDialogBox';
import { useHistory } from 'react-router-dom';
import useSnackbar from 'src/utils/useSnackbar';
import { useOrganization, useLocalization } from 'src/providers/hooks';
import { TimeZoneDescription } from 'src/types/TimeZones';
import TimeZoneSelector from 'src/components/TimeZoneSelector';
import RegionSelector from 'src/components/RegionSelector';
import { useDeviceInfo } from '@terraware/web-components/utils';

const useStyles = makeStyles((theme: Theme) => ({
  otherDetails: {
    marginTop: theme.spacing(1),
  },
}));

type LocationTypesSelected = Record<ManagedLocationType, boolean>;

export type AddNewOrganizationModalProps = {
  open: boolean;
  onCancel: () => void;
};

export default function AddNewOrganizationModal(props: AddNewOrganizationModalProps): JSX.Element {
  const classes = useStyles();
  const { reloadOrganizations } = useOrganization();
  const { activeLocale } = useLocalization();
  const history = useHistory();
  const { onCancel, open } = props;
  const snackbar = useSnackbar();
  const { isDesktop } = useDeviceInfo();
  const [nameError, setNameError] = useState('');
  const [timeZoneError, setTimeZoneError] = useState('');
  const [countryError, setCountryError] = useState('');
  const [stateError, setStateError] = useState('');
  const [organizationTypeError, setOrganizationTypeError] = useState('');
  const [organizationTypeDetailsError, setOrganizationTypeDetailsError] = useState('');
  const [locationTypes, setLocationTypes] = useState<LocationTypesSelected>({} as LocationTypesSelected);
  const [hasStates, setHasStates] = useState<boolean>(false);
  const [newOrganization, setNewOrganization, onChange] = useForm<Organization>({
    id: -1,
    name: '',
    role: 'Owner',
    totalUsers: 0,
  });

  const managedLocationTypeOptions = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return ManagedLocationTypes.map((managedLocationType: ManagedLocationType) => ({
      label: managedLocationTypeLabel(managedLocationType) ?? '',
      value: managedLocationType,
    }));
  }, [activeLocale]);

  const organizationTypeOptions = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return OrganizationTypes.map((organizationType: OrganizationType) => ({
      label: organizationTypeLabel(organizationType) ?? '',
      value: organizationType,
    }));
  }, [activeLocale]);

  useEffect(() => {
    setNewOrganization({
      id: -1,
      name: '',
      role: 'Owner',
      totalUsers: 0,
    });
    setLocationTypes(
      ManagedLocationTypes.reduce(
        (acc: LocationTypesSelected, location: ManagedLocationType) => ({ ...acc, [location]: false }),
        {} as LocationTypesSelected
      )
    );
  }, [open, setNewOrganization]);

  const onTimeZoneChange = (value: TimeZoneDescription) => {
    if (value?.id) {
      onChange('timeZone', value.id);
      setTimeZoneError('');
    }
  };

  const saveOrganization = async () => {
    let hasErrors = false;

    if (newOrganization.name === '') {
      setNameError(strings.REQUIRED_FIELD);
      hasErrors = true;
    }

    if (!newOrganization.timeZone) {
      setTimeZoneError(strings.REQUIRED_FIELD);
      hasErrors = true;
    }

    if (!newOrganization.countryCode) {
      setCountryError(strings.REQUIRED_FIELD);
      hasErrors = true;
    }

    if (hasStates && !newOrganization.countrySubdivisionCode) {
      setStateError(strings.REQUIRED_FIELD);
      hasErrors = true;
    }

    if (!newOrganization.organizationType) {
      setOrganizationTypeError(strings.REQUIRED_FIELD);
      hasErrors = true;
    } else if (newOrganization.organizationType === 'Other' && !newOrganization.organizationTypeDetails?.trim()) {
      setOrganizationTypeDetailsError(strings.REQUIRED_FIELD);
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    const response = await OrganizationService.createOrganization(
      newOrganization,
      ManagedLocationTypes.filter((locationType: ManagedLocationType) => locationTypes[locationType])
    );
    if (response.requestSucceeded && response.organization) {
      snackbar.pageSuccess(
        isDesktop ? strings.ORGANIZATION_CREATED_MSG_DESKTOP : strings.ORGANIZATION_CREATED_MSG,
        strings.formatString(strings.ORGANIZATION_CREATED_TITLE, response.organization.name)
      );
      reloadOrganizations();
      history.push({ pathname: APP_PATHS.HOME });
    } else {
      snackbar.toastError(strings.GENERIC_ERROR, strings.ORGANIZATION_CREATE_FAILED);
    }
    onCancel();
  };

  const onCancelWrapper = () => {
    setNameError('');
    onCancel();
  };

  const onChangeOrganizationType = (value: any) => {
    onChange('organizationTypeDetails', undefined);
    onChange('organizationType', value);
    setOrganizationTypeError('');
    setOrganizationTypeDetailsError('');
  };

  return (
    <DialogBox
      onClose={onCancelWrapper}
      open={open}
      title={strings.ADD_ORGANIZATION}
      size='medium'
      middleButtons={[
        <Button
          id='cancelCreateOrg'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onCancelWrapper}
          key='button-1'
        />,
        <Button id='saveCreateOrg' label={strings.SAVE} onClick={saveOrganization} key='button-2' />,
      ]}
    >
      <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
        <Grid item xs={12}>
          <TextField
            label={strings.ORGANIZATION_NAME_REQUIRED}
            type='text'
            id='name'
            onChange={(value) => {
              onChange('name', value);
              setNameError('');
            }}
            errorText={nameError}
            value={newOrganization.name}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={strings.DESCRIPTION}
            type='text'
            id='description'
            onChange={(value) => onChange('description', value)}
            value={newOrganization.description}
          />
        </Grid>
        <RegionSelector
          selectedCountryCode={newOrganization.countryCode}
          selectedCountrySubdivisionCode={newOrganization.countrySubdivisionCode}
          onChangeCountryCode={(countryCode: string, hasSubdivisions: boolean) => {
            setNewOrganization((previousNewOrganization: Organization): Organization => {
              return { ...previousNewOrganization, countryCode, countrySubdivisionCode: undefined };
            });
            setCountryError('');
            setHasStates(hasSubdivisions);
          }}
          onChangeCountrySubdivisionCode={(countrySubdivisionCode: string) => {
            onChange('countrySubdivisionCode', countrySubdivisionCode);
            setStateError('');
          }}
          countryError={countryError}
          countrySubdivisionError={stateError}
        />
        <Grid item xs={12} sx={{ '&.MuiGrid-item': { paddingTop: 0 } }}>
          <TimeZoneSelector
            label={strings.TIME_ZONE_REQUIRED}
            onTimeZoneSelected={onTimeZoneChange}
            selectedTimeZone={newOrganization.timeZone}
            countryCode={newOrganization.countryCode}
            tooltip={strings.TOOLTIP_TIME_ZONE_ORGANIZATION}
            errorText={timeZoneError}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            type='text'
            label={strings.CREATE_ORGANIZATION_QUESTION_LOCATION_TYPES}
            id='create-org-question-location-types'
            display={true}
          />
          <Box display='flex' flexDirection='column'>
            {managedLocationTypeOptions.map((option) => (
              <Checkbox
                key={option.value}
                disabled={false}
                id={`location-type-${option.value}`}
                name={option.label}
                label={option.label}
                value={locationTypes[option.value] === true}
                onChange={(value) => setLocationTypes((prev) => ({ ...prev, [option.value]: value }))}
              />
            ))}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            required
            label={strings.CREATE_ORGANIZATION_QUESTION_ORGANIZATION_TYPE}
            onChange={onChangeOrganizationType}
            selectedValue={newOrganization.organizationType}
            options={organizationTypeOptions}
            fullWidth={true}
            errorText={organizationTypeError}
          />
          {newOrganization.organizationType === 'Other' && (
            <TextField
              required
              className={classes.otherDetails}
              type='text'
              label={strings.CREATE_ORGANIZATION_QUESTION_ORGANIZATION_TYPE_DETAILS}
              id='create-org-question-website'
              display={false}
              onChange={(value) => {
                onChange('organizationTypeDetails', value);
                setOrganizationTypeDetailsError('');
              }}
              errorText={organizationTypeDetailsError}
              value={newOrganization.organizationTypeDetails}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          <TextField
            type='text'
            label={strings.CREATE_ORGANIZATION_QUESTION_WEBSITE}
            id='create-org-question-website'
            display={false}
            onChange={(value) => onChange('website', value)}
            value={newOrganization.website}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
