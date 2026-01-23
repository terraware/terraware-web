import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import ErrorBox from 'src/components/common/ErrorBox/ErrorBox';
import PageForm from 'src/components/common/PageForm';
import TextField from 'src/components/common/Textfield/Textfield';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS, EMAIL_REGEX } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import { OrganizationUserService } from 'src/services';
import strings from 'src/strings';
import { OrganizationUser } from 'src/types/User';
import { isAdmin } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

export default function PersonView(): JSX.Element {
  const { selectedOrganization, reloadOrganizations } = useOrganization();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const [emailError, setEmailError] = useState('');
  const snackbar = useSnackbar();
  const [repeatedEmail, setRepeatedEmail] = useState('');
  const [pageError, setPageError] = useState<'REPEATED_EMAIL' | 'INVALID_EMAIL'>();
  const [people, setPeople] = useState<OrganizationUser[]>();
  const { personId } = useParams<{ personId: string }>();
  const [personSelectedToEdit, setPersonSelectedToEdit] = useState<OrganizationUser>();
  const { isDesktop, isMobile, isTablet } = useDeviceInfo();

  const [newPerson, setNewPerson, , onChangeCallback] = useForm<OrganizationUser>({
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
  }, [selectedOrganization, personSelectedToEdit, setNewPerson]);

  useEffect(() => {
    if (selectedOrganization) {
      const populatePeople = async () => {
        const response = await OrganizationUserService.getOrganizationUsers(selectedOrganization.id);
        if (personId && response.requestSucceeded) {
          setPeople(response.users);
          setPersonSelectedToEdit(response.users.find((user) => user.id === parseInt(personId, 10)));
        }
      };
      void populatePeople();
    }
  }, [selectedOrganization, personId]);

  const goToPeople = useCallback(() => {
    navigate({ pathname: APP_PATHS.PEOPLE });
  }, [navigate]);

  const goToViewPerson = (userId: string) => {
    navigate({ pathname: APP_PATHS.PEOPLE_VIEW.replace(':personId', userId) });
  };

  const saveUser = async () => {
    setPageError(undefined);

    if (newPerson.email === '') {
      setEmailError(strings.REQUIRED_FIELD);
      return;
    }

    if (!EMAIL_REGEX.test(newPerson.email)) {
      setEmailError(strings.INCORRECT_EMAIL_FORMAT);
      return;
    }

    let successMessage: string | null = null;
    let userId = -1;

    if (!!personSelectedToEdit && selectedOrganization) {
      const response = await OrganizationUserService.updateOrganizationUser(
        selectedOrganization.id,
        newPerson.id,
        newPerson.role
      );
      successMessage = response.requestSucceeded ? strings.CHANGES_SAVED : null;
      userId = newPerson.id;
    } else {
      const response = await OrganizationUserService.createOrganizationUser(selectedOrganization?.id || -1, {
        ...newPerson,
      });
      if (!response.requestSucceeded) {
        if (response.errorDetails === 'PRE_EXISTING_USER') {
          setRepeatedEmail(newPerson.email);
          setPageError('REPEATED_EMAIL');
          setEmailError(strings.EMAIL_ALREADY_EXISTS);
          return;
        } else if (response.errorDetails === 'INVALID_EMAIL') {
          setPageError('INVALID_EMAIL');
          setEmailError(strings.INCORRECT_EMAIL_FORMAT);
          return;
        }
      }
      if (response.requestSucceeded) {
        userId = response.userId;
      }
      successMessage = response.requestSucceeded ? strings.PERSON_ADDED : null;
    }

    if (successMessage) {
      snackbar.toastSuccess(successMessage);
      void reloadOrganizations();
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
        navigate(profileLocation);
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

  const roleOptions = [
    { label: strings.CONTRIBUTOR, value: 'Contributor' },
    { label: strings.ADMIN, value: 'Admin' },
    { label: strings.MANAGER, value: 'Manager' },
  ];
  if (newPerson.role === 'Owner') {
    roleOptions.push({ label: strings.OWNER, value: 'Owner' });
  }

  useEffect(() => {
    if (!isAdmin(selectedOrganization)) {
      goToPeople();
    }
  }, [selectedOrganization, goToPeople]);

  // TODO: Handle the case where we cannot find the requested person to edit in the list of people.
  return (
    <TfMain>
      <PageForm cancelID='cancelNewPerson' saveID='saveNewPerson' onCancel={goToPeople} onSave={() => void saveUser()}>
        <Grid container marginBottom={theme.spacing(4)} paddingLeft={theme.spacing(3)}>
          <Grid item xs={12}>
            <h2 style={{ marginBottom: '8px' }}>
              {personSelectedToEdit ? personSelectedToEdit.email : strings.ADD_PERSON}
            </h2>
            {!personSelectedToEdit ? (
              <p style={{ marginTop: '8px', marginBottom: 0 }}>{strings.ADD_PERSON_DESC}</p>
            ) : null}
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
            marginBottom: theme.spacing(8),
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={gridSize()}>
              <TextField
                id='email'
                label={strings.EMAIL_REQUIRED}
                type='text'
                onChange={onChangeCallback('email')}
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
                onChange={onChangeCallback('firstName')}
                disabled={true}
                value={newPerson.firstName}
              />
            </Grid>
            <Grid item xs={gridSize()}>
              <TextField
                id='lastName'
                label={strings.LAST_NAME}
                type='text'
                onChange={onChangeCallback('lastName')}
                disabled={true}
                value={newPerson.lastName}
              />
            </Grid>
          </Grid>
          <Box display='flex' flexDirection='column' marginTop={isDesktop ? theme.spacing(3) : theme.spacing(4)}>
            <Box width={roleSelectSize()} marginTop={theme.spacing(4)}>
              <Dropdown
                id='role'
                label={strings.ROLE_REQUIRED}
                onChange={onChangeCallback('role')}
                options={roleOptions}
                disabled={newPerson.role === 'Owner'}
                selectedValue={newPerson.role}
                fullWidth
                tooltipTitle={
                  <Box>
                    <p style={{ margin: 0 }}>{strings.ROLES_INFO}</p>
                    <ul style={{ margin: 0 }}>
                      <li>{strings.CONTRIBUTOR_INFO}</li>
                      <li>{strings.MANAGER_INFO}</li>
                      <li>{strings.ADMIN_INFO}</li>
                    </ul>
                  </Box>
                }
              />
            </Box>
          </Box>
        </Box>
      </PageForm>
    </TfMain>
  );
}
