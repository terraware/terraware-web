import React, { useEffect, useState } from 'react';
import { createOrganization } from 'src/api/organization/organization';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import useForm from 'src/utils/useForm';
import Select from './common/Select/Select';
import TextField from './common/Textfield/Textfield';
import { searchCountries } from 'src/api/country/country';
import { Country } from 'src/types/Country';
import { getCountryByCode, getSubdivisionByCode } from 'src/utils/country';
import { APP_PATHS } from '../constants';
import DialogBox from './common/DialogBox/DialogBox';
import { Grid } from '@mui/material';
import { useHistory } from 'react-router-dom';
import useSnackbar from 'src/utils/useSnackbar';
import { useOrganization } from 'src/providers/hooks';

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
  const [countries, setCountries] = useState<Country[]>();
  const [newOrganization, setNewOrganization, onChange] = useForm<ServerOrganization>({
    id: -1,
    name: '',
    role: 'Owner',
    totalUsers: 0,
  });

  useEffect(() => {
    let cancel = false;
    const populateCountries = async () => {
      const response = await searchCountries();
      if (response && !cancel) {
        setCountries(response);
      }
    };
    populateCountries();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    setNewOrganization({
      id: -1,
      name: '',
      role: 'Owner',
      totalUsers: 0,
    });
  }, [open, setNewOrganization]);

  const onChangeCountry = (newValue: string) => {
    const found = countries?.find((country) => country.name === newValue);
    if (found) {
      setNewOrganization((previousNewOrganization: ServerOrganization): ServerOrganization => {
        return { ...previousNewOrganization, countryCode: found.code.toString(), countrySubdivisionCode: undefined };
      });
    }
  };

  const onChangeSubdivision = (newValue: string) => {
    const selectedCountry = getSelectedCountry();
    const found = selectedCountry?.subdivisions?.find((subdivision) => subdivision.name === newValue);
    if (found) {
      onChange('countrySubdivisionCode', found.code);
    }
  };

  const saveOrganization = async () => {
    if (newOrganization.name === '') {
      setNameError(strings.REQUIRED_FIELD);
      return;
    }
    const response = await createOrganization(newOrganization);
    if (response.requestSucceeded && response.organization) {
      snackbar.pageSuccess(
        strings.ORGANIZATION_CREATED_MSG,
        strings.formatString(strings.ORGANIZATION_CREATED_TITLE, response.organization.name)
      );
      reloadData(response.organization.id);
      history.push({ pathname: APP_PATHS.HOME });
    } else {
      snackbar.toastError(strings.GENERIC_ERROR, strings.ORGANIZATION_CREATE_FAILED);
    }
    onCancel();
  };

  const getSelectedCountry = () => {
    if (countries && newOrganization.countryCode) {
      const selectedCountry = getCountryByCode(countries, newOrganization.countryCode);
      if (selectedCountry) {
        return selectedCountry;
      }
    }
  };

  const getSelectedSubdivision = () => {
    if (countries && newOrganization.countryCode && newOrganization.countrySubdivisionCode) {
      const selectedSubdivision = getSubdivisionByCode(
        countries,
        newOrganization.countryCode,
        newOrganization.countrySubdivisionCode
      );
      if (selectedSubdivision) {
        return selectedSubdivision;
      }
    }
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
            onChange={(value) => onChange('name', value)}
            errorText={newOrganization.name ? '' : nameError}
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
        <Grid item xs={12}>
          <Select
            label={strings.COUNTRY}
            id='countyCode'
            onChange={onChangeCountry}
            options={countries?.map((country) => country.name)}
            selectedValue={getSelectedCountry()?.name}
            fullWidth
          />
        </Grid>
        {getSelectedCountry()?.subdivisions && (
          <Grid item xs={12}>
            <Select
              label={strings.STATE}
              id='countySubdivisionCode'
              onChange={onChangeSubdivision}
              options={getSelectedCountry()?.subdivisions?.map((subdivision) => subdivision.name)}
              selectedValue={getSelectedSubdivision()?.name}
              fullWidth
            />
          </Grid>
        )}
      </Grid>
    </DialogBox>
  );
}
