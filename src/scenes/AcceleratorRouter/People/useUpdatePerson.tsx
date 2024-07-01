import { useCallback, useEffect, useMemo, useState } from 'react';

import { requestUpdateGlobalRolesUser } from 'src/redux/features/globalRoles/globalRolesAsyncThunks';
import { selectGlobalRolesUserUpdateRequest } from 'src/redux/features/globalRoles/globalRolesSelectors';
import { requestUpdateUserDeliverableCategories } from 'src/redux/features/userDeliverableCategories/userDeliverableCategoriesAsyncThunks';
import { selectUserDeliverableCategoriesUpdateRequest } from 'src/redux/features/userDeliverableCategories/userDeliverableCategoriesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { UserWithDeliverableCategories } from 'src/scenes/AcceleratorRouter/People/UserWithDeliverableCategories';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  busy?: boolean;
  succeeded?: boolean;
  update: (user: UserWithDeliverableCategories) => void;
};

export default function useUpdatePerson(): Response {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [categoriesRequestId, setCategoriesRequestId] = useState('');
  const categoriesRequest = useAppSelector(selectUserDeliverableCategoriesUpdateRequest(categoriesRequestId));
  const [globalRolesRequestId, setGlobalRolesRequestId] = useState('');
  const globalRolesRequest = useAppSelector(selectGlobalRolesUserUpdateRequest(globalRolesRequestId));

  const update = useCallback(
    (user: UserWithDeliverableCategories) => {
      const categoriesRequest = dispatch(
        requestUpdateUserDeliverableCategories({
          user: user,
          deliverableCategories: user.deliverableCategories,
        })
      );

      setCategoriesRequestId(categoriesRequest.requestId);

      const globalRolesRequest = dispatch(
        requestUpdateGlobalRolesUser({
          user: user,
          globalRoles: user.globalRoles,
        })
      );

      setGlobalRolesRequestId(globalRolesRequest.requestId);
    },
    [dispatch]
  );

  useEffect(() => {
    if (categoriesRequest?.status === 'error' || globalRolesRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [categoriesRequest, globalRolesRequest, snackbar]);

  return useMemo<Response>(
    () => ({
      busy: categoriesRequest?.status === 'pending' || globalRolesRequest?.status === 'pending',
      succeeded: categoriesRequest?.status === 'success' && globalRolesRequest?.status === 'success',
      update,
    }),
    [update, categoriesRequest, globalRolesRequest]
  );
}
