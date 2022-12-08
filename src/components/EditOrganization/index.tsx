import { Box, Container, Grid, Theme, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import TextField from '../common/Textfield/Textfield';
import useForm from 'src/utils/useForm';
import Select from '../common/Select/Select';
import FormBottomBar from '../common/FormBottomBar';
import { Country, Subdivision } from 'src/types/Country';
import { searchCountries } from 'src/api/country/country';
import { updateOrganization } from 'src/api/organization/organization';
import { getCountryByCode, getSubdivisionByCode } from 'src/utils/country';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageSnackbar from 'src/components/PageSnackbar';
import useSnackbar from 'src/utils/useSnackbar';
import TfMain from 'src/components/common/TfMain';

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(7),
    marginBottom: (props: StyleProps) => (props.isMobile ? theme.spacing(40) : theme.spacing(6)),
    background: theme.palette.TwClrBg,
  },
}));

type OrganizationViewProps = {
  organization: ServerOrganization;
  reloadOrganizationData: () => void;
};

export default function OrganizationView({ organization, reloadOrganizationData }: OrganizationViewProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const [organizationRecord, setOrganizationRecord, onChange] = useForm<ServerOrganization>(organization);
  const [nameError, setNameError] = useState('');
  const [countries, setCountries] = useState<Country[]>();
  const history = useHistory();
  const snackbar = useSnackbar();

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
          marginBottom: '160px',
        }}
      >
        <Grid item xs={gridSize()} paddingBottom={theme.spacing(4)}>
          <TextField
            id='name'
            label={strings.ORGANIZATION_NAME_REQUIRED}
            type='text'
            onChange={onChange}
            value={organizationRecord.name}
            errorText={organizationRecord.name ? '' : nameError}
          />
        </Grid>
        <Grid item xs={gridSize()} paddingLeft={!isMobile ? theme.spacing(2) : 0} paddingBottom={theme.spacing(4)}>
          <TextField
            id='description'
            label={strings.DESCRIPTION}
            type='textarea'
            onChange={onChange}
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
        {getSelectedCountry()?.subdivisions && (
          <Grid item xs={gridSize()} paddingLeft={!isMobile ? theme.spacing(2) : 0}>
            <Select
              label={strings.STATE}
              id='countySubdivisionCode'
              onChange={onChangeSubdivision}
              options={getSelectedCountry()?.subdivisions.map((subdivision) => subdivision.name)}
              selectedValue={getSelectedSubdivision()?.name}
              fullWidth
            />
          </Grid>
        )}
      </Grid>
      <FormBottomBar onCancel={goToOrganization} onSave={saveOrganization} />
    </TfMain>
  );
}
