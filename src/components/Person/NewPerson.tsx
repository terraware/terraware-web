import { Container, Grid, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import TfDivisor from '../common/TfDivisor';
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

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(7),
    marginBottom: theme.spacing(6),
    background: theme.palette.TwClrBg,
    height: 'calc(100% - 96px)',
    overflow: 'scroll',
  },
  mobileContainer: {
    paddingBottom: theme.spacing(35),
  },
  backIcon: {
    fill: theme.palette.TwClrIcnBrand,
    marginRight: theme.spacing(1),
  },
  back: {
    display: 'flex',
    textDecoration: 'none',
    color: theme.palette.TwClrTxtBrand,
    fontSize: '20px',
    alignItems: 'center',
  },
  value: {
    fontSize: '16px',
  },
  titleWithButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: theme.palette.TwClrTxtSecondary,
    lineHeight: '20px',
    fontFamily: '"Inter", sans-serif',
  },
  datePicker: {
    marginTop: '4px',
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: theme.palette.TwClrBrdrSecondary,
      },
    },
  },
  blockCheckbox: {
    display: 'block',
  },
  generalTitle: {
    fontSize: '20px',
    marginBottom: '8px',
  },
  titleSubtitle: {
    marginTop: '8px',
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
  const history = useHistory();
  const [emailError, setEmailError] = useState('');
  const snackbar = useSnackbar();
  const [repeatedEmail, setRepeatedEmail] = useState('');
  const [pageError, setPageError] = useState<'REPEATED_EMAIL' | 'INVALID_EMAIL'>();
  const [people, setPeople] = useState<OrganizationUser[]>();
  const { personId } = useParams<{ personId: string }>();
  const [personSelectedToEdit, setPersonSelectedToEdit] = useState<OrganizationUser>();
  const { isMobile } = useDeviceInfo();

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
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  // TODO: Handle the case where we cannot find the requested person to edit in the list of people.
  return (
    <>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3} className={`${isMobile ? classes.mobileContainer : ''}`}>
          <Grid item xs={12}>
            {isMobile ? (
              <h3 className={classes.title}>
                {personSelectedToEdit ? personSelectedToEdit.email : strings.ADD_PERSON}
              </h3>
            ) : (
              <h2 className={classes.title}>
                {personSelectedToEdit ? personSelectedToEdit.email : strings.ADD_PERSON}
              </h2>
            )}
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
          {!personSelectedToEdit ? (
            <Grid item xs={12}>
              <h3 className={classes.generalTitle}>{strings.GENERAL}</h3>
              <p className={classes.titleSubtitle}>{strings.ADD_PERSON_GENERAL_DESC}</p>
            </Grid>
          ) : null}
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
          <Grid item xs={12}>
            <p>{strings.ROLES_INFO}</p>
            <ul>
              <li>{strings.CONTRIBUTOR_INFO}</li>
              <li>{strings.MANAGER_INFO}</li>
              <li>{strings.ADMIN_INFO}</li>
            </ul>
          </Grid>
          <Grid item xs={gridSize()}>
            <Select
              id='role'
              label={strings.ROLE_REQUIRED}
              onChange={onChangeRole}
              options={['Contributor', 'Admin', 'Manager']}
              disabled={newPerson.role === 'Owner'}
              selectedValue={newPerson.role}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} />
          <Grid item xs={12}>
            <TfDivisor />
          </Grid>
        </Grid>
      </Container>
      <FormBottomBar onCancel={goToPeople} onSave={() => saveUser()} />
    </>
  );
}
