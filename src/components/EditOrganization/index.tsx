import { Container, Grid, Theme } from '@mui/material';
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

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(7),
    marginBottom: (props: StyleProps) => (props.isMobile ? theme.spacing(40) : theme.spacing(6)),
    background: '#ffffff',
  },
}));

type OrganizationViewProps = {
  organization: ServerOrganization;
  reloadOrganizationData: () => void;
};

export default function OrganizationView({ organization, reloadOrganizationData }: OrganizationViewProps): JSX.Element {
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
        snackbar.toastSuccess('Changes saved');
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
    return 4;
  };

  return (
    <>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <h2>{strings.ORGANIZATION}</h2>
            <p>{strings.ORGANIZATION_DESC}</p>
            <PageSnackbar />
          </Grid>
          <Grid item xs={gridSize()}>
            <TextField
              id='name'
              label={strings.ORGANIZATION_NAME_REQUIRED}
              type='text'
              onChange={onChange}
              value={organizationRecord.name}
              errorText={organizationRecord.name ? '' : nameError}
            />
          </Grid>
          <Grid item xs={gridSize()}>
            <TextField
              id='description'
              label={strings.DESCRIPTION}
              type='textarea'
              onChange={onChange}
              value={organizationRecord.description}
            />
          </Grid>
          {isMobile === false && <Grid item xs={4} />}
          <Grid item xs={gridSize()}>
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
            <Grid item xs={gridSize()}>
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
      </Container>
      <FormBottomBar onCancel={goToOrganization} onSave={saveOrganization} />
    </>
  );
}
