import { Container, createStyles, Grid, makeStyles } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
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
};

export default function OrganizationView({ organization }: OrganizationViewProps): JSX.Element {
  const [nameError, setNameError] = useState('');

  const [record, setRecord, onChange] = useForm<ServerOrganization>(organization);
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const [countries, setCountries] = useState<Country[]>();
  const [selectedCountry, setSelectedCountry] = useState<Country>();
  const history = useHistory();
  const classes = useStyles();

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
      setRecord({ ...record, countryCode: found.code.toString(), countrySubdivisionCode: undefined });
      setSelectedCountry(found);
    }
  };

  const onChangeSubdivision = (newValue: string) => {
    const found = selectedCountry?.subdivisions.find((subdivision: Subdivision) => subdivision.name === newValue);
    if (found) {
      onChange('countrySubdivisionCode', found.code);
    }
  };

  const goToHome = () => {
    const home = {
      pathname: `/home`,
    };
    history.push(home);
  };

  const getSelectedCountry = () => {
    if (countries) {
      const found = countries.find((country) => country.code.toString() === record.countryCode);
      if (found) {
        return found.name;
      }
    }
  };

  const getSelectedState = () => {
    if (countries && selectedCountry) {
      const found = selectedCountry.subdivisions.find(
        (subdivision) => subdivision.code.toString() === record.countrySubdivisionCode
      );
      if (found) {
        return found.name;
      }
    }
  };

  const saveOrganization = async () => {
    if (record.name === '') {
      setNameError('Required Field');
    } else {
      const response = await updateOrganization(record);
      if (response.requestSucceeded) {
        setSnackbar({
          type: 'success',
          msg: 'Changes saved',
        });
      } else {
        setSnackbar({
          type: 'delete',
          msg: strings.GENERIC_ERROR,
        });
      }
      goToHome();
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
              value={record.name}
              errorText={record.name ? '' : nameError}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='description'
              label={strings.DESCRIPTION}
              type='textarea'
              onChange={onChange}
              value={record.description}
            />
          </Grid>
          <Grid item xs={4} />
          <Grid item xs={4}>
            <Select
              label={strings.COUNTRY_OPTIONAL}
              id='countyCode'
              onChange={onChangeCountry}
              options={countries?.map((country) => country.name)}
              selectedValue={getSelectedCountry()}
            />
          </Grid>
          {selectedCountry?.subdivisions && (
            <Grid item xs={4}>
              <Select
                label={strings.STATE_OPTIONAL}
                id='countySubdivisionCode'
                onChange={onChangeSubdivision}
                options={selectedCountry.subdivisions.map((subdivision: Subdivision) => subdivision.name)}
                selectedValue={getSelectedState()}
              />
            </Grid>
          )}
        </Grid>
      </Container>
      <FormBottomBar onCancel={goToHome} onSave={saveOrganization} />
    </>
  );
}
