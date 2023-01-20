import { Box, Grid, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import TextField from '../common/Textfield/Textfield';
import useForm from 'src/utils/useForm';
import Select from '../common/Select/Select';
import PageForm from '../common/PageForm';
import { Country, Subdivision } from 'src/types/Country';
import { searchCountries } from 'src/api/country/country';
import { updateOrganization } from 'src/api/organization/organization';
import { getCountryByCode, getSubdivisionByCode } from 'src/utils/country';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageSnackbar from 'src/components/PageSnackbar';
import useSnackbar from 'src/utils/useSnackbar';
import TfMain from 'src/components/common/TfMain';
import isEnabled from 'src/features';
import { getUTC, useUserTimeZone } from 'src/utils/useTimeZoneUtils';
import TimeZoneSelector from 'src/components/TimeZoneSelector';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { useTimeZones } from 'src/providers';

type OrganizationViewProps = {
  organization: ServerOrganization;
  reloadOrganizationData: () => void;
};

export default function OrganizationView({ organization, reloadOrganizationData }: OrganizationViewProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [organizationRecord, setOrganizationRecord, onChange] = useForm<ServerOrganization>(organization);
  const [nameError, setNameError] = useState('');
  const [countries, setCountries] = useState<Country[]>();
  const history = useHistory();
  const snackbar = useSnackbar();
  const timeZones = useTimeZones();
  const defaultTimeZone = useUserTimeZone()?.id || getUTC(timeZones).id;
  const timeZoneFeatureEnabled = isEnabled('Timezones');

  useEffect(() => {
    const populateCountries = async () => {
      const response = await searchCountries();
      if (response) {
        setCountries(response);
      }
    };
    populateCountries();
  }, []);

  const onChangeCountry = (newValue: string) => {
    const found = countries?.find((country) => country.name === newValue);
    if (found) {
      setOrganizationRecord((previousOrganizationRecord: ServerOrganization): ServerOrganization => {
        return {
          ...previousOrganizationRecord,
          countryCode: found.code.toString(),
          countrySubdivisionCode: undefined,
        };
      });
    }
  };

  const onChangeSubdivision = (newValue: string) => {
    if (countries && organizationRecord.countryCode) {
      const selectedCountry = getCountryByCode(countries, organizationRecord.countryCode);
      const found = selectedCountry?.subdivisions.find((subdivision: Subdivision) => subdivision.name === newValue);
      if (found) {
        onChange('countrySubdivisionCode', found.code);
      }
    }
  };

  const getSelectedCountry = () => {
    if (countries && organizationRecord.countryCode) {
      const selectedCountry = getCountryByCode(countries, organizationRecord.countryCode);
      if (selectedCountry) {
        return selectedCountry;
      }
    }
  };

  const getSelectedSubdivision = () => {
    if (countries && organizationRecord.countryCode && organizationRecord.countrySubdivisionCode) {
      const selectedSubdivision = getSubdivisionByCode(
        countries,
        organizationRecord.countryCode,
        organizationRecord.countrySubdivisionCode
      );
      if (selectedSubdivision) {
        return selectedSubdivision;
      }
    }
  };

  const onChangeTimeZone = (newTimeZone: TimeZoneDescription | undefined) => {
    setOrganizationRecord((previousRecord: ServerOrganization): ServerOrganization => {
      return {
        ...previousRecord,
        timeZone: newTimeZone ? newTimeZone.id : undefined,
      };
    });
  };

  const goToOrganization = () => {
    const organizationLocation = {
      pathname: APP_PATHS.ORGANIZATION,
    };
    history.push(organizationLocation);
  };

  const saveOrganization = async () => {
    if (organizationRecord.name === '') {
      setNameError('Required field.');
    } else {
      const response = await updateOrganization(organizationRecord);
      if (response.requestSucceeded) {
        snackbar.toastSuccess(strings.CHANGES_SAVED);
        reloadOrganizationData();
      } else {
        snackbar.toastError();
      }
      goToOrganization();
    }
  };

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 6;
  };

  return (
    <TfMain>
      <PageForm cancelID='cancelEditOrg' saveID='saveEditOrg' onCancel={goToOrganization} onSave={saveOrganization}>
        <Box margin={theme.spacing(0, 3, 4, 3)}>
          <Box display='flex' flexDirection='column' justifyContent='space-between' marginBottom={theme.spacing(1)}>
            <Typography margin={0} fontSize='24px' fontWeight={600}>
              {strings.ORGANIZATION}
            </Typography>
            <PageSnackbar />
          </Box>
        </Box>
        <Grid
          container
          sx={{
            backgroundColor: theme.palette.TwClrBg,
            borderRadius: '32px',
            padding: theme.spacing(3),
            marginBottom: theme.spacing(10),
          }}
        >
          <Grid item xs={gridSize()} paddingBottom={theme.spacing(4)}>
            <TextField
              id='name'
              label={strings.ORGANIZATION_NAME_REQUIRED}
              type='text'
              onChange={(value) => onChange('name', value)}
              value={organizationRecord.name}
              errorText={organizationRecord.name ? '' : nameError}
            />
          </Grid>
          <Grid item xs={gridSize()} paddingLeft={isMobile ? 0 : theme.spacing(2)} paddingBottom={theme.spacing(4)}>
            <TextField
              id='description'
              label={strings.DESCRIPTION}
              type='textarea'
              onChange={(value) => onChange('description', value)}
              value={organizationRecord.description}
            />
          </Grid>
          <Grid item xs={gridSize()} paddingBottom={theme.spacing(4)}>
            <Select
              label={strings.COUNTRY}
              id='countyCode'
              onChange={onChangeCountry}
              options={countries?.map((country) => country.name)}
              selectedValue={getSelectedCountry()?.name}
              fullWidth
            />
          </Grid>
          {getSelectedCountry()?.subdivisions ? (
            <Grid item xs={gridSize()} paddingLeft={isMobile ? 0 : theme.spacing(2)} paddingBottom={theme.spacing(4)}>
              <Select
                label={strings.STATE}
                id='countySubdivisionCode'
                onChange={onChangeSubdivision}
                options={getSelectedCountry()?.subdivisions.map((subdivision) => subdivision.name)}
                selectedValue={getSelectedSubdivision()?.name}
                fullWidth
              />
            </Grid>
          ) : (
            !isMobile && <Grid item xs={gridSize()} paddingLeft={isMobile ? 0 : theme.spacing(2)} />
          )}
          {timeZoneFeatureEnabled && (
            <Grid item xs={gridSize()}>
              <TimeZoneSelector
                selectedTimeZone={organizationRecord.timeZone || defaultTimeZone}
                onTimeZoneSelected={onChangeTimeZone}
                label={strings.TIME_ZONE}
                tooltip={strings.TOOLTIP_TIME_ZONE_ORGANIZATION}
              />
            </Grid>
          )}
        </Grid>
      </PageForm>
    </TfMain>
  );
}
