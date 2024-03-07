import React, { useEffect, useState } from 'react';

import { useLocalization } from 'src/providers';
import { requestListGlobalRolesUsers } from 'src/redux/features/globalRoles/globalRolesAsyncThunks';
import { selectGlobalRolesUsersSearchRequest } from 'src/redux/features/globalRoles/globalRolesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import AcceleratorMain from 'src/scenes/AcceleratorRouter/AcceleratorMain';
import strings from 'src/strings';
import { UserWithGlobalRoles } from 'src/types/GlobalRoles';
import useSnackbar from 'src/utils/useSnackbar';

const PeopleView = () => {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();

  const [globalRoleUsers, setGlobalRoleUsers] = useState<UserWithGlobalRoles[]>();
  const [requestId, setRequestId] = useState('');

  const listRequest = useAppSelector(selectGlobalRolesUsersSearchRequest(requestId));

  useEffect(() => {
    if (!listRequest) {
      return;
    }

    if (listRequest.status === 'success') {
      setGlobalRoleUsers(listRequest.data?.users);
    } else if (listRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [listRequest, snackbar]);

  useEffect(() => {
    const request = dispatch(requestListGlobalRolesUsers({ locale: activeLocale }));
    setRequestId(request.requestId);
  }, [activeLocale, dispatch]);

  // tslint:disable:no-console
  console.log('globalRoleUsers', globalRoleUsers);

  return <AcceleratorMain />;
};

export default PeopleView;
