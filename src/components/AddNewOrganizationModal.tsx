import React, { useEffect, useState } from 'react';
import { OrganizationService } from 'src/services';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import { Organization } from 'src/types/Organization';
import useForm from 'src/utils/useForm';
import TextField from './common/Textfield/Textfield';
import { APP_PATHS } from '../constants';
import DialogBox from './common/DialogBox/DialogBox';
import { Grid } from '@mui/material';
import { useHistory } from 'react-router-dom';
import useSnackbar from 'src/utils/useSnackbar';
import { useOrganization } from 'src/providers/hooks';
import { TimeZoneDescription } from 'src/types/TimeZones';
import isEnabled from 'src/features';
import TimeZoneSelector from 'src/components/TimeZoneSelector';
import RegionSelector from 'src/components/RegionSelector';

export type AddNewOrganizationModalProps = {
  open: boolean;
  onCancel: () => void;
};

export default function AddNewOrganizationModal(props: AddNewOrganizationModalProps): JSX.Element {
  const { reloadData } = useOrganization();
  const history = useHistory();
  const { onCancel, open } = props;
  const snackbar = useSnackbar();
  const [nameError, setNameError] = useState('');
  const [timeZoneError, setTimeZoneError] = useState('');
  const [countryError, setCountryError] = useState('');
  const [stateError, setStateError] = useState('');
  const [hasStates, setHasStates] = useState<boolean>(false);
  const [newOrganization, setNewOrganization, onChange] = useForm<Organization>({
    id: -1,
    name: '',
    role: 'Owner',
    totalUsers: 0,
  });
  const timeZonesEnabled = isEnabled('Timezones');

  useEffect(() => {
    setNewOrganization({
      id: -1,
      name: '',
      role: 'Owner',
      totalUsers: 0,
    });
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

    if (timeZonesEnabled && !newOrganization.timeZone) {
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

    if (hasErrors) {
      return;
    }

    const response = await OrganizationService.createOrganization(newOrganization);
    if (response.requestSucceeded && response.organization) {
      snackbar.pageSuccess(
        strings.ORGANIZATION_CREATED_MSG,
        strings.formatString(strings.ORGANIZATION_CREATED_TITLE, response.organization.name)
      );
      reloadData();
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
        {timeZonesEnabled && (
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
        )}
      </Grid>
    </DialogBox>
  );
}
