import React, { type JSX, useEffect, useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { Dropdown } from '@terraware/web-components';

import ErrorBox from 'src/components/common/ErrorBox/ErrorBox';
import ScrollableDialogBox from 'src/components/common/ScrollableDialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { APP_PATHS, EMAIL_REGEX } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useTrackEvent } from 'src/hooks/useTrackEvent';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useOrganization } from 'src/providers/hooks';
import {
  useAddOrganizationUserMutation,
  useListOrganizationUsersQuery,
  useUpdateOrganizationUserMutation,
} from 'src/queries/generated/organizationUsers';
import strings from 'src/strings';
import { OrganizationUser } from 'src/types/User';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

export type PersonModalProps = {
  open: boolean;
  onClose: () => void;
  person?: OrganizationUser;
};

type PersonForm = Omit<OrganizationUser, 'addedTime'>;

const emptyPerson: PersonForm = {
  id: -1,
  email: '',
  role: 'Contributor',
  firstName: '--',
  lastName: '--',
};

export default function PersonModal({ open, onClose, person }: PersonModalProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const trackEvent = useTrackEvent();
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const [emailError, setEmailError] = useState('');
  const [repeatedEmail, setRepeatedEmail] = useState('');
  const [pageError, setPageError] = useState<'REPEATED_EMAIL' | 'INVALID_EMAIL'>();
  const [addOrganizationUser] = useAddOrganizationUserMutation();
  const [updateOrganizationUser] = useUpdateOrganizationUserMutation();
  const { currentData: peopleData } = useListOrganizationUsersQuery(
    open && !person && selectedOrganization ? selectedOrganization.id : skipToken
  );
  const people = peopleData?.users;

  const [editedPerson, setEditedPerson, , onChangeCallback] = useForm<PersonForm>(emptyPerson);

  useEffect(() => {
    if (open) {
      setEmailError('');
      setRepeatedEmail('');
      setPageError(undefined);
      setEditedPerson(
        person
          ? {
              id: person.id,
              email: person.email,
              role: person.role,
              firstName: person.firstName,
              lastName: person.lastName,
            }
          : emptyPerson
      );
    }
  }, [open, person, setEditedPerson]);

  const saveUser = async () => {
    setPageError(undefined);
    const formName = person ? 'person_edit' : 'person_invite';

    if (editedPerson.email === '') {
      trackEvent(MIXPANEL_EVENTS.FORM_VALIDATION_FAILED, {
        form_name: formName,
        error_count: 1,
        fields_with_errors: ['email_empty'],
      });
      setEmailError(strings.REQUIRED_FIELD);
      return;
    }

    if (!EMAIL_REGEX.test(editedPerson.email)) {
      trackEvent(MIXPANEL_EVENTS.FORM_VALIDATION_FAILED, {
        form_name: formName,
        error_count: 1,
        fields_with_errors: ['email_format'],
      });
      setEmailError(strings.INCORRECT_EMAIL_FORMAT);
      return;
    }

    let successMessage: string | null = null;
    let addedUserId = -1;

    if (person && selectedOrganization) {
      const response = await updateOrganizationUser({
        organizationId: selectedOrganization.id,
        userId: editedPerson.id,
        updateOrganizationUserRequestPayload: { role: editedPerson.role },
      });
      const succeeded = !('error' in response);
      if (succeeded) {
        trackEvent(MIXPANEL_EVENTS.USER_ROLE_UPDATED, { new_role: editedPerson.role });
      } else {
        trackEvent(MIXPANEL_EVENTS.SAVE_FAILED, { entity_type: 'user_role_update' });
      }
      successMessage = succeeded ? strings.CHANGES_SAVED : null;
    } else {
      let errorDetails: 'PRE_EXISTING_USER' | 'INVALID_EMAIL' | undefined;
      try {
        const response = await addOrganizationUser({
          organizationId: selectedOrganization?.id || -1,
          addOrganizationUserRequestPayload: { email: editedPerson.email, role: editedPerson.role },
        }).unwrap();
        trackEvent(MIXPANEL_EVENTS.USER_INVITED, { role: editedPerson.role });
        addedUserId = response.id;
        successMessage = strings.PERSON_ADDED;
      } catch (e) {
        const error = e as { status?: number; data?: { error?: { message?: string } } };
        if (error.status === 409) {
          errorDetails = 'PRE_EXISTING_USER';
        } else if (error.data?.error?.message === 'Field value has incorrect format: email') {
          errorDetails = 'INVALID_EMAIL';
        }
        trackEvent(MIXPANEL_EVENTS.SAVE_FAILED, {
          entity_type: 'user_invitation',
          error_details: errorDetails,
        });
        if (errorDetails === 'PRE_EXISTING_USER') {
          setRepeatedEmail(editedPerson.email);
          setPageError('REPEATED_EMAIL');
          setEmailError(strings.EMAIL_ALREADY_EXISTS);
          return;
        } else if (errorDetails === 'INVALID_EMAIL') {
          setPageError('INVALID_EMAIL');
          setEmailError(strings.INCORRECT_EMAIL_FORMAT);
          return;
        }
      }
    }

    if (successMessage) {
      snackbar.toastSuccess(successMessage);
      if (person) {
        onClose();
      } else {
        navigate({ pathname: APP_PATHS.PEOPLE_VIEW.replace(':personId', addedUserId.toString()) });
      }
    } else {
      snackbar.toastError();
      onClose();
    }
  };

  const goToProfile = () => {
    if (people && repeatedEmail) {
      const profile = people.find((person_) => person_.email === repeatedEmail);
      if (profile) {
        navigate({ pathname: APP_PATHS.PEOPLE_VIEW.replace(':personId', profile.id.toString()) });
      }
    }
  };

  const roleOptions = [
    { label: strings.CONTRIBUTOR, value: 'Contributor' },
    { label: strings.ADMIN, value: 'Admin' },
    { label: strings.MANAGER, value: 'Manager' },
  ];
  if (editedPerson.role === 'Owner') {
    roleOptions.push({ label: strings.OWNER, value: 'Owner' });
  }

  return (
    <ScrollableDialogBox
      onClose={onClose}
      open={open}
      title={person ? person.email : strings.ADD_PERSON}
      size='medium'
      middleButtons={[
        <Button
          id='cancelNewPerson'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          key='button-1'
        />,
        <Button id='saveNewPerson' label={strings.SAVE} onClick={() => void saveUser()} key='button-2' />,
      ]}
    >
      <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
        {!person && (
          <Grid item xs={12}>
            <Typography>{strings.ADD_PERSON_DESC}</Typography>
          </Grid>
        )}
        {pageError === 'REPEATED_EMAIL' && repeatedEmail && (
          <Grid item xs={12}>
            <ErrorBox
              text={strings.ALREADY_INVITED_PERSON_ERROR}
              buttonText={strings.GO_TO_PROFILE}
              onClick={goToProfile}
            />
          </Grid>
        )}
        {pageError === 'INVALID_EMAIL' && (
          <Grid item xs={12}>
            <ErrorBox title={strings.UNABLE_TO_ADD_PERSON} text={strings.FIX_HIGHLIGHTED_FIELDS} />
          </Grid>
        )}
        <Grid item xs={12}>
          <TextField
            id='email'
            label={strings.EMAIL_REQUIRED}
            type='text'
            onChange={onChangeCallback('email')}
            value={editedPerson.email}
            disabled={!!person}
            errorText={emailError}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='firstName'
            label={strings.FIRST_NAME}
            type='text'
            onChange={onChangeCallback('firstName')}
            disabled={true}
            value={editedPerson.firstName}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='lastName'
            label={strings.LAST_NAME}
            type='text'
            onChange={onChangeCallback('lastName')}
            disabled={true}
            value={editedPerson.lastName}
          />
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            id='role'
            label={strings.ROLE_REQUIRED}
            onChange={onChangeCallback('role')}
            options={roleOptions}
            disabled={editedPerson.role === 'Owner'}
            selectedValue={editedPerson.role}
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
        </Grid>
      </Grid>
    </ScrollableDialogBox>
  );
}
