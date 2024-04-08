import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { selectUserRequest } from 'src/redux/features/user/usersSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { User } from 'src/types/User';
import useSnackbar from 'src/utils/useSnackbar';

import { PersonContext, PersonData } from './PersonContext';

export type Props = {
  children: React.ReactNode;
};

const PersonProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const pathParams = useParams<{ userId: string }>();
  const userId = Number(pathParams.userId);

  const [personData, setPersonData] = useState<PersonData>({ userId });

  const [user, setUser] = useState<User>();
  const userRequest = useAppSelector(selectUserRequest(userId));

  useEffect(() => {
    if (userId !== -1) {
      void dispatch(requestGetUser(userId));
    }
  }, [userId, dispatch]);

  useEffect(() => {
    if (!userRequest) {
      return;
    }

    if (userRequest.status === 'success') {
      setUser(userRequest.data?.user);
    } else if (userRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [userRequest, snackbar]);

  useEffect(() => {
    setPersonData({
      user,
      userId,
    });
  }, [userId, user]);

  return <PersonContext.Provider value={personData}>{children}</PersonContext.Provider>;
};

export default PersonProvider;
