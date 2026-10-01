import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import Page from 'src/components/Page';
import UnsavedChangesBadge from 'src/components/common/UnsavedChangesBadge';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { UserWithInternalnterests } from 'src/scenes/AcceleratorRouter/People/UserWithInternalInterests';
import useUpdatePerson from 'src/scenes/AcceleratorRouter/People/useUpdatePerson';
import strings from 'src/strings';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import PersonForm from './PersonForm';
import usePerson from './usePerson';

const EditView = () => {
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const updatePerson = useUpdatePerson();
  const pathParams = useParams<{ userId: string }>();
  const [userId] = useState(Number(pathParams.userId || -1));
  const user = usePerson(userId);
  const [record, setRecord] = useState<UserWithInternalnterests>();
  const isDirty =
    !!user &&
    record?.id === user.id &&
    (JSON.stringify(record.globalRoles?.toSorted() ?? []) !== JSON.stringify(user.globalRoles?.toSorted() ?? []) ||
      JSON.stringify(record.internalInterests?.toSorted() ?? []) !==
        JSON.stringify(user.internalInterests?.toSorted() ?? []));

  const goToViewPerson = useCallback(
    () => navigate(getLocation(APP_PATHS.ACCELERATOR_PERSON.replace(':userId', `${userId}`), location)),
    [navigate, location, userId]
  );

  const handleOnSave = useCallback(
    (person: UserWithInternalnterests) => {
      updatePerson.update(person);
    },
    [updatePerson]
  );

  useEffect(() => {
    if (updatePerson.succeeded) {
      goToViewPerson();
    }
  }, [updatePerson, goToViewPerson]);

  const title = (
    <Box
      alignItems='center'
      display='flex'
      flexWrap='wrap'
      gap={theme.spacing(1.5)}
      sx={{ paddingLeft: theme.spacing(3) }}
    >
      <Typography fontSize='24px' fontWeight={600}>
        {user?.email || ''}
      </Typography>
      {isDirty && <UnsavedChangesBadge />}
    </Box>
  );

  const rightComponent = (
    <Box alignItems='center' display='flex' gap={theme.spacing(1)} justifyContent='flex-end'>
      <Button
        disabled={updatePerson.busy}
        id='cancelEditUser'
        label={strings.CANCEL}
        onClick={goToViewPerson}
        priority='secondary'
        size='medium'
        type='passive'
      />
      <Button
        disabled={!isDirty || updatePerson.busy}
        id='saveUser'
        label={strings.SAVE}
        onClick={() => {
          if (record && isDirty && !updatePerson.busy) {
            handleOnSave(record);
          }
        }}
        size='medium'
      />
    </Box>
  );

  return (
    <Page
      title={title}
      rightComponent={rightComponent}
      stickyHeader
      stickyHeaderElevated={isDirty}
      contentStyle={{ display: 'flex', flexDirection: 'column' }}
    >
      {user && (
        <PersonForm
          hideEdit
          onChange={setRecord}
          busy={updatePerson.busy}
          onSave={handleOnSave}
          onCancel={goToViewPerson}
          user={user}
        />
      )}
    </Page>
  );
};

export default EditView;
