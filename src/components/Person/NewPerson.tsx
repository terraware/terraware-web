import { Box, Grid, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { OrganizationUser } from 'src/types/User';
import TextField from '../common/Textfield/Textfield';
import useForm from 'src/utils/useForm';
import Select from '../common/Select/Select';
import { addOrganizationUser, updateOrganizationUser } from 'src/api/user/user';
import ErrorBox from '../common/ErrorBox/ErrorBox';
import { getOrganizationUsers } from 'src/api/organization/organization';
import { APP_PATHS } from 'src/constants';
import dictionary from 'src/strings/dictionary';
import FormBottomBar from '../common/FormBottomBar';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageSnackbar from 'src/components/PageSnackbar';
import useSnackbar from 'src/utils/useSnackbar';
import TfMain from 'src/components/common/TfMain';

const useStyles = makeStyles((theme: Theme) => ({
  titleSubtitle: {
    marginTop: '8px',
    marginBottom: 0,
  },
  title: {
    marginBottom: '8px',
  },
}));

type PersonViewProps = {
  organization: ServerOrganization;
  reloadOrganizationData: () => void;
};

export default function PersonView({ organization, reloadOrganizationData }: PersonViewProps): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const [emailError, setEmailError] = useState('');
  const snackbar = useSnackbar();
  const [repeatedEmail, setRepeatedEmail] = useState('');
  const [pageError, setPageError] = useState<'REPEATED_EMAIL' | 'INVALID_EMAIL'>();
  const [people, setPeople] = useState<OrganizationUser[]>();
  const { personId } = useParams<{ personId: string }>();
  const [personSelectedToEdit, setPersonSelectedToEdit] = useState<OrganizationUser>();
  const { isMobile, isTablet } = useDeviceInfo();

  const [newPerson, setNewPerson, onChange] = useForm<OrganizationUser>({
    id: -1,
    email: '',
    role: 'Contributor',
    firstName: '--',
    lastName: '--',
  });

  useEffect(() => {
    if (personSelectedToEdit) {
      setNewPerson({
        id: personSelectedToEdit.id,
        email: personSelectedToEdit.email,
        role: personSelectedToEdit.role,
        firstName: personSelectedToEdit.firstName,
        lastName: personSelectedToEdit.lastName,
      });
    }
  }, [organization, personSelectedToEdit, setNewPerson]);

  useEffect(() => {
    const populatePeople = async () => {
      if (organization) {
        const response = await getOrganizationUsers(organization);
        if (response.requestSucceeded) {
          setPeople(response.users);
          setPersonSelectedToEdit(response.users.find((user) => user.id === parseInt(personId, 10)));
        }
      }
    };
    if (organization) {
      populatePeople();
    }
  }, [organization, personId]);

  const onChangeRole = (newRole: string) => {
    onChange('role', newRole);
  };

  const goToPeople = () => {
    history.push({ pathname: APP_PATHS.PEOPLE });
  };

  const goToViewPerson = (userId: string) => {
    history.push({ pathname: APP_PATHS.PEOPLE_VIEW.replace(':personId', userId) });
  };

  const saveUser = async () => {
    setPageError(undefined);

    if (newPerson.email === '') {
      setEmailError(dictionary.REQUIRED_FIELD);
      return;
    }

    // https://stackoverflow.com/questions/46155/whats-the-best-way-to-validate-an-email-address-in-javascript
    if (
      !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        newPerson.email
      )
    ) {
      setEmailError(dictionary.INCORRECT_EMAIL_FORMAT);
      return;
    }

    let successMessage: string | null = null;
    let userId: number = -1;

    if (!!personSelectedToEdit) {
      const response = await updateOrganizationUser(newPerson.id, organization.id, newPerson.role);
      successMessage = response.requestSucceeded ? strings.CHANGES_SAVED : null;
      userId = newPerson.id;
    } else {
      const response = await addOrganizationUser({ ...newPerson }, organization.id);
      if (!response.requestSucceeded) {
        if (response.errorDetails === 'PRE_EXISTING_USER') {
          setRepeatedEmail(newPerson.email);
          setPageError('REPEATED_EMAIL');
          setEmailError(strings.EMAIL_ALREADY_EXISTS);
          return;
        } else if (response.errorDetails === 'INVALID_EMAIL') {
          setPageError('INVALID_EMAIL');
          setEmailError(dictionary.INCORRECT_EMAIL_FORMAT);
          return;
        }
      }
      if (response.requestSucceeded) {
        userId = response.newUserId;
      }
      successMessage = response.requestSucceeded ? dictionary.PERSON_ADDED : null;
    }

    if (successMessage) {
      snackbar.toastSuccess(successMessage);
      await reloadOrganizationData();
      goToViewPerson(userId.toString());
    } else {
      snackbar.toastError();
      goToPeople();
    }
  };

  const goToProfile = () => {
    if (people && repeatedEmail) {
      const profile = people.find((person) => person.email === repeatedEmail);
      if (profile) {
        const profileLocation = {
          pathname: APP_PATHS.PEOPLE_VIEW.replace(':personId', profile.id.toString()),
        };
        history.push(profileLocation);
      }
    }
  };

  const gridSize = () => {
    if (isMobile || isTablet) {
      return 12;
    }
    return 4;
  };

  const roleSelectSize = () => {
    if (isMobile) {
      return '100%';
    } else if (isTablet) {
      return '50%';
    }

    return '33%';
  };

  // TODO: Handle the case where we cannot find the requested person to edit in the list of people.
  return (
    <TfMain>
      <Grid container marginBottom={theme.spacing(4)} paddingLeft={theme.spacing(3)}>
        <Grid item xs={12}>
          <h2 className={classes.title}>{personSelectedToEdit ? personSelectedToEdit.email : strings.ADD_PERSON}</h2>
          {!personSelectedToEdit ? <p className={classes.titleSubtitle}>{strings.ADD_PERSON_DESC}</p> : null}
          <PageSnackbar />
          {pageError === 'REPEATED_EMAIL' && repeatedEmail && (
            <ErrorBox
              text={strings.ALREADY_INVITED_PERSON_ERROR}
              buttonText={strings.GO_TO_PROFILE}
              onClick={goToProfile}
            />
          )}
          {pageError === 'INVALID_EMAIL' && (
            <ErrorBox title={strings.UNABLE_TO_ADD_PERSON} text={strings.FIX_HIGHLIGHTED_FIELDS} />
          )}
        </Grid>
      </Grid>
      <Box
        sx={{
          backgroundColor: theme.palette.TwClrBg,
          borderRadius: '32px',
          padding: theme.spacing(3),
          marginBottom: isMobile ? theme.spacing(32) : theme.spacing(25),
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={gridSize()}>
            <TextField
              id='email'
              label={strings.EMAIL_REQUIRED}
              type='text'
              onChange={onChange}
              value={newPerson.email}
              disabled={!!personSelectedToEdit}
              errorText={emailError}
            />
          </Grid>
          <Grid item xs={gridSize()}>
            <TextField
              id='firstName'
              label={strings.FIRST_NAME}
              type='text'
              onChange={onChange}
              disabled={true}
              value={newPerson.firstName}
            />
          </Grid>
          <Grid item xs={gridSize()}>
            <TextField
              id='lastName'
              label={strings.LAST_NAME}
              type='text'
              onChange={onChange}
              disabled={true}
              value={newPerson.lastName}
            />
          </Grid>
        </Grid>
        <Box display='flex' flexDirection='column' marginTop={theme.spacing(9)}>
          <Box>
            <p>{strings.ROLES_INFO}</p>
            <ul>
              <li>{strings.CONTRIBUTOR_INFO}</li>
              <li>{strings.MANAGER_INFO}</li>
              <li>{strings.ADMIN_INFO}</li>
            </ul>
          </Box>
          <Box width={roleSelectSize()}>
            <Select
              id='role'
              label={strings.ROLE_REQUIRED}
              onChange={onChangeRole}
              options={['Contributor', 'Admin', 'Manager']}
              disabled={newPerson.role === 'Owner'}
              selectedValue={newPerson.role}
              fullWidth
            />
          </Box>
        </Box>
      </Box>
      <FormBottomBar onCancel={goToPeople} onSave={() => saveUser()} />
    </TfMain>
  );
}
