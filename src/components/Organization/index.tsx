import { Container, createStyles, Grid, makeStyles } from '@material-ui/core';
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
import { getOrganizationProjects } from 'src/utils/organization';
import Snackbar from 'src/components/Snackbar';

const useStyles = makeStyles((theme) =>
  createStyles({
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
  })
);

type OrganizationViewProps = {
  organization?: ServerOrganization;
};
export default function OrganizationView({ organization }: OrganizationViewProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const [countries, setCountries] = useState<Country[]>();
  const [people, setPeople] = useState<OrganizationUser[]>();

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
      return new Date(organization.createdTime).toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
      });
    }
  };

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <h2 className={classes.title}>{strings.ORGANIZATION}</h2>
          <p>{strings.ORGANIZATION_DESC}</p>
        </Grid>
        <Snackbar displayType='page' />
        <Grid item xs={12} className={classes.titleWithButton}>
          <h2>{organization?.name}</h2>
          <Button label={strings.EDIT_ORGANIZATION} priority='secondary' onClick={goToEditOrganization} />
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.NAME} id='name' type='text' value={organization?.name} display={true} />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label={strings.DESCRIPTION_OPTIONAL}
            id='description'
            type='text'
            value={organization?.description}
            display={true}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField label={strings.DATE_ADDED} id='dateAdded' type='text' value={getDateAdded()} display={true} />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label={strings.COUNTRY_OPTIONAL}
            id='country'
            type='text'
            value={
              countries && organization?.countryCode ? getCountryByCode(countries, organization.countryCode)?.name : ''
            }
            display={true}
          />
        </Grid>
        <Grid item xs={4}>
          {organization?.countrySubdivisionCode && (
            <TextField
              label={strings.STATE_OPTIONAL}
              id='state'
              type='text'
              value={organizationState()}
              display={true}
            />
          )}
        </Grid>
        <Grid item xs={4} />
        <Grid item xs={4}>
          <TextField
            label={strings.NUMBER_OF_PROJECTS}
            id='numberOfProjects'
            type='text'
            value={getOrganizationProjects(organization).length.toString()}
            display={true}
          />
        </Grid>
        <Grid item xs={4}>
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
