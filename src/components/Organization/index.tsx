import { Container, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import TfDivisor from '../common/TfDivisor';
import TextField from '../common/Textfield/Textfield';
import Button from '../common/button/Button';
import { Country } from 'src/types/Country';
import { searchCountries } from 'src/api/country/country';
import { getOrganizationUsers } from 'src/api/organization/organization';
import { OrganizationUser } from 'src/types/User';
import { getCountryByCode, getSubdivisionByCode } from 'src/utils/country';
import PageSnackbar from 'src/components/PageSnackbar';
import { makeStyles } from '@mui/styles';
import { getDateDisplayValue } from '@terraware/web-components/utils';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles(() => ({
  mainContainer: {
    paddingTop: '24px',
    background: '#ffffff',
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    flexDirection: 'column',
  },
  titleWithButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    marginTop: 0,
    fontSize: '24px',
  },
  titleButtonContainer: {
    display: 'flex',
    justifyContent: 'right',
  },
}));

type OrganizationViewProps = {
  organization?: ServerOrganization;
};
export default function OrganizationView({ organization }: OrganizationViewProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const [countries, setCountries] = useState<Country[]>();
  const [people, setPeople] = useState<OrganizationUser[]>();
  const { isMobile } = useDeviceInfo();

  useEffect(() => {
    const populateCountries = async () => {
      const response = await searchCountries();
      if (response) {
        setCountries(response);
      }
    };
    const populatePeople = async () => {
      if (organization) {
        const response = await getOrganizationUsers(organization);
        if (response.requestSucceeded) {
          setPeople(response.users);
        }
      }
    };
    populateCountries();
    populatePeople();
  }, [organization]);

  const goToEditOrganization = () => {
    const editOrganizationLocation = {
      pathname: APP_PATHS.ORGANIZATION_EDIT,
    };
    history.push(editOrganizationLocation);
  };

  const organizationState = () => {
    if (countries && organization?.countryCode && organization?.countrySubdivisionCode) {
      return getSubdivisionByCode(countries, organization.countryCode, organization.countrySubdivisionCode)?.name;
    }
  };

  const getDateAdded = () => {
    if (organization?.createdTime) {
      return getDateDisplayValue(organization.createdTime);
    }
  };

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <h2 className={classes.title}>{strings.ORGANIZATION}</h2>
          <p>{strings.ORGANIZATION_DESC}</p>
        </Grid>
        <PageSnackbar />
        <Grid item xs={12} className={classes.titleWithButton}>
          <Grid item xs={8}>
            <h2>{organization?.name}</h2>
          </Grid>
          <Grid item xs={4} className={classes.titleButtonContainer}>
            {isMobile ? (
              <Button icon='iconEdit' priority='secondary' onClick={goToEditOrganization} />
            ) : (
              <Button icon='iconEdit' label={strings.EDIT} priority='secondary' onClick={goToEditOrganization} />
            )}
          </Grid>
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField
            label={strings.ORGANIZATION_NAME}
            id='name'
            type='text'
            value={organization?.name}
            display={true}
          />
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField
            label={strings.DESCRIPTION}
            id='description'
            type='text'
            value={organization?.description}
            display={true}
          />
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField label={strings.DATE_ADDED} id='dateAdded' type='text' value={getDateAdded()} display={true} />
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField
            label={strings.COUNTRY}
            id='country'
            type='text'
            value={
              countries && organization?.countryCode ? getCountryByCode(countries, organization.countryCode)?.name : ''
            }
            display={true}
          />
        </Grid>
        <Grid item xs={gridSize()}>
          {organization?.countrySubdivisionCode && (
            <TextField label={strings.STATE} id='state' type='text' value={organizationState()} display={true} />
          )}
        </Grid>
        {isMobile === false && <Grid item xs={4} />}
        <Grid item xs={gridSize()}>
          <TextField
            label={strings.NUMBER_OF_PEOPLE}
            id='numberOfPeople'
            type='text'
            value={people?.length.toString()}
            display={true}
          />
        </Grid>
        <Grid item xs={12} />
        <Grid item xs={12}>
          <TfDivisor />
        </Grid>
      </Grid>
    </Container>
  );
}
