import { Container, createStyles, Grid, makeStyles } from '@material-ui/core';
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
import snackbarAtom from 'src/state/snackbar';
import { useSetRecoilState } from 'recoil';
import ErrorBox from '../common/ErrorBox/ErrorBox';
import { getOrganizationUsers } from 'src/api/organization/organization';
import { APP_PATHS } from 'src/constants';
import dictionary from 'src/strings/dictionary';
import FormBottomBar from '../common/FormBottomBar';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(7),
      marginBottom: theme.spacing(6),
      background: '#ffffff',
    },
    backIcon: {
      fill: '#007DF2',
      marginRight: theme.spacing(1),
    },
    back: {
      display: 'flex',
      textDecoration: 'none',
      color: '#0067C8',
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
      color: '#5C6B6C',
      lineHeight: '20px',
      fontFamily: '"Inter", sans-serif',
    },
    datePicker: {
      marginTop: '4px',
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#708284',
        },
      },
    },
    blockCheckbox: {
      display: 'block',
    },
  })
);

type PersonViewProps = {
  organization: ServerOrganization;
  reloadOrganizationData: () => void;
};

export default function PersonView({ organization, reloadOrganizationData }: PersonViewProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const [emailError, setEmailError] = useState('');
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const [repeatedEmail, setRepeatedEmail] = useState('');
  const [pageError, setPageError] = useState<'REPEATED_EMAIL' | 'INVALID_EMAIL'>();
  const [people, setPeople] = useState<OrganizationUser[]>();
  const { personId } = useParams<{ personId: string }>();
  const [personSelectedToEdit, setPersonSelectedToEdit] = useState<OrganizationUser>();

  const [newPerson, setNewPerson, onChange] = useForm<OrganizationUser>({
    id: -1,
    email: '',
    role: 'Contributor',
    projectIds: [],
  });

  useEffect(() => {
    if (personSelectedToEdit) {
      setNewPerson({
        id: personSelectedToEdit.id,
        email: personSelectedToEdit.email,
        role: personSelectedToEdit.role,
        projectIds: personSelectedToEdit.projectIds,
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

  const saveUser = async (didConfirmProjectRemoval: boolean) => {
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
      setSnackbar({
        type: 'toast',
        priority: 'success',
        msg: successMessage,
      });
      await reloadOrganizationData();
      goToViewPerson(userId.toString());
    } else {
      setSnackbar({
        type: 'toast',
        priority: 'critical',
        msg: strings.GENERIC_ERROR,
      });
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

  // TODO: Handle the case where we cannot find the requested person to edit in the list of people.
  return (
    <>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {personSelectedToEdit ? <h2>{strings.EDIT_PERSON}</h2> : <h2>{strings.ADD_PERSON}</h2>}
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
            <p>{strings.ADD_PERSON_DESC}</p>
          </Grid>
          <Grid item xs={4}>
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
          <Grid item xs={4}>
            <TextField
              id='firstName'
              label={strings.FIRST_NAME}
              type='text'
              onChange={onChange}
              disabled={true}
              value='--'
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='lastName'
              label={strings.LAST_NAME}
              type='text'
              onChange={onChange}
              disabled={true}
              value='--'
            />
          </Grid>
          <Grid item xs={12}>
            <p>{strings.ROLES_INFO}</p>
            <ul>
              <li>{strings.CONTRIBUTOR_INFO}</li>
              <li>{strings.ADMIN_INFO}</li>
            </ul>
          </Grid>
          <Grid item xs={4}>
            <Select
              id='role'
              label={strings.ROLE}
              onChange={onChangeRole}
              options={['Contributor', 'Admin']}
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
      <FormBottomBar onCancel={goToPeople} onSave={() => saveUser(false)} />
    </>
  );
}
