import { Container, createStyles, Grid, makeStyles } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import TextField from '../common/Textfield/Textfield';
import useForm from 'src/utils/useForm';
import Select from '../common/Select/Select';
import { useSetRecoilState } from 'recoil';
import snackbarAtom from 'src/state/snackbar';
import FormBottomBar from '../common/FormBottomBar';
import { Country, Subdivision } from 'src/types/Country';
import { searchCountries } from 'src/api/country/country';
import { updateOrganization } from 'src/api/organization/organization';
import { getCountryByCode, getSubdivisionByCode } from 'src/utils/country';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(7),
      marginBottom: theme.spacing(6),
      background: '#ffffff',
    },
  })
);

type OrganizationViewProps = {
  organization: ServerOrganization;
  reloadOrganizationData: () => void;
};

export default function OrganizationView({ organization, reloadOrganizationData }: OrganizationViewProps): JSX.Element {
  const classes = useStyles();
  const [organizationRecord, setOrganizationRecord, onChange] = useForm<ServerOrganization>(organization);
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const [nameError, setNameError] = useState('');
  const [countries, setCountries] = useState<Country[]>();
  const history = useHistory();

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
      setOrganizationRecord({
        ...organizationRecord,
        countryCode: found.code.toString(),
        countrySubdivisionCode: undefined,
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
      setNameError('Required Field');
    } else {
      const response = await updateOrganization(organizationRecord);
      if (response.requestSucceeded) {
        setSnackbar({
          type: 'toast',
          priority: 'success',
          msg: 'Changes saved',
        });
        reloadOrganizationData();
      } else {
        setSnackbar({
          type: 'toast',
          priority: 'critical',
          msg: strings.GENERIC_ERROR,
        });
      }
      goToOrganization();
    }
  };

  return (
    <>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <h2>{strings.ORGANIZATION}</h2>
            <p>{strings.ORGANIZATION_DESC}</p>
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='name'
              label={strings.NAME}
              type='text'
              onChange={onChange}
              value={organizationRecord.name}
              errorText={organizationRecord.name ? '' : nameError}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='description'
              label={strings.DESCRIPTION_OPTIONAL}
              type='textarea'
              onChange={onChange}
              value={organizationRecord.description}
            />
          </Grid>
          <Grid item xs={4} />
          <Grid item xs={4}>
            <Select
              label={strings.COUNTRY_OPTIONAL}
              id='countyCode'
              onChange={onChangeCountry}
              options={countries?.map((country) => country.name)}
              selectedValue={getSelectedCountry()?.name}
            />
          </Grid>
          {getSelectedCountry()?.subdivisions && (
            <Grid item xs={4}>
              <Select
                label={strings.STATE_OPTIONAL}
                id='countySubdivisionCode'
                onChange={onChangeSubdivision}
                options={getSelectedCountry()?.subdivisions.map((subdivision) => subdivision.name)}
                selectedValue={getSelectedSubdivision()?.name}
              />
            </Grid>
          )}
        </Grid>
      </Container>
      <FormBottomBar onCancel={goToOrganization} onSave={saveOrganization} />
    </>
  );
}
