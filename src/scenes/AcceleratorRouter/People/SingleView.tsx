import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Grid, useTheme } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useUser } from 'src/providers';
import strings from 'src/strings';
import { getHighestGlobalRole } from 'src/types/GlobalRoles';
import { internalInterestLabel } from 'src/types/UserInternalInterests';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import { usePersonData } from './PersonContext';

const SingleView = () => {
  const navigate = useNavigate();
  const location = useStateLocation();
  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
  const theme = useTheme();
  const { user, userId } = usePersonData();

  const canEdit = isAllowed('ASSIGN_SOME_GLOBAL_ROLES');

  const goToEditPerson = useCallback(
    () => navigate(getLocation(APP_PATHS.ACCELERATOR_PERSON_EDIT.replace(':userId', `${userId}`), location)),
    [navigate, location, userId]
  );

  const rightComponent = useMemo(
    () =>
      activeLocale &&
      canEdit && (
        <Button label={strings.EDIT_PERSON} icon='iconEdit' onClick={goToEditPerson} size='medium' id='editPerson' />
      ),
    [activeLocale, canEdit, goToEditPerson]
  );

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.PEOPLE : '',
        to: APP_PATHS.ACCELERATOR_PEOPLE,
      },
    ],
    [activeLocale]
  );

  const internalInterests = useMemo(
    () =>
      user?.internalInterests
        ?.map((internalInterest) => internalInterestLabel(internalInterest))
        ?.toSorted()
        ?.join(strings.LIST_SEPARATOR),
    [user]
  );

  return (
    <Page crumbs={crumbs} title={user?.email || ''} rightComponent={rightComponent}>
      <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: '24px' }}>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <TextField label={strings.NAME} id='name' type='text' value={user?.email} display={true} />
          </Grid>
          <Grid item xs={4}>
            <TextField label={strings.FIRST_NAME} id='firstName' type='text' value={user?.firstName} display={true} />
          </Grid>
          <Grid item xs={4}>
            <TextField label={strings.LAST_NAME} id='lastName' type='text' value={user?.lastName} display={true} />
          </Grid>
        </Grid>
        <Grid container spacing={3} sx={{ marginTop: theme.spacing(1) }}>
          <Grid item xs={4}>
            <TextField
              label={strings.ROLE}
              id='globalRoles'
              type='text'
              value={getHighestGlobalRole(user?.globalRoles)}
              display={true}
            />
          </Grid>
          <Grid item xs={8}>
            <TextField
              id='internalInterests'
              label={strings.INTERNAL_INTERESTS}
              type='text'
              value={internalInterests}
              display={true}
            />
          </Grid>
        </Grid>
      </Card>
    </Page>
  );
};

export default SingleView;
