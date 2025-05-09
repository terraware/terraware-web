import React, { useEffect, useState } from 'react';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { requestFundingEntityForUser } from 'src/redux/features/funder/entities/fundingEntitiesAsyncThunks';
import { selectUserFundingEntityRequest } from 'src/redux/features/funder/entities/fundingEntitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import useEnvironment from 'src/utils/useEnvironment';

import { ProvidedUserFundingEntityData } from './DataTypes';
import { UserFundingEntityContext } from './contexts';
import { useUser } from './hooks';

export type UserFundingEntityProviderProps = {
  children?: React.ReactNode;
};

enum APIRequestStatus {
  'AWAITING',
  'FAILED',
  'SUCCEEDED',
}

export default function UserFundingEntityProvider({ children }: UserFundingEntityProviderProps) {
  const { user, bootstrapped: userBootstrapped } = useUser();
  const dispatch = useAppDispatch();
  const [entityAPIRequestStatus, setEntityAPIRequestStatus] = useState<APIRequestStatus>(APIRequestStatus.AWAITING);
  const navigate = useSyncNavigate();
  const { isDev, isStaging } = useEnvironment();
  const getUserFundingEntityRequest = useAppSelector(selectUserFundingEntityRequest(user?.id));
  const [fundingEntityData, setFundingEntityData] = useState<ProvidedUserFundingEntityData>({
    userFundingEntity: undefined,
    bootstrapped: false,
  });

  useEffect(() => {
    if (userBootstrapped && user && user.userType === 'Funder') {
      void dispatch(requestFundingEntityForUser(user.id));
    }
  }, [userBootstrapped, user, dispatch]);

  useEffect(() => {
    if (!getUserFundingEntityRequest) {
      return;
    }

    if (getUserFundingEntityRequest.status === 'success' && getUserFundingEntityRequest.data) {
      setEntityAPIRequestStatus(APIRequestStatus.SUCCEEDED);
      setFundingEntityData({
        userFundingEntity: getUserFundingEntityRequest.data.userFundingEntity,
        bootstrapped: true,
      });
    } else if (getUserFundingEntityRequest.status === 'error') {
      setEntityAPIRequestStatus(APIRequestStatus.FAILED);
    }
  }, [getUserFundingEntityRequest]);

  useEffect(() => {
    if (entityAPIRequestStatus === APIRequestStatus.FAILED) {
      if (isDev || isStaging) {
        if (confirm(strings.DEV_SERVER_ERROR)) {
          window.location.reload();
        }
      } else {
        navigate(APP_PATHS.ERROR_FAILED_TO_FETCH_ORG_DATA);
      }
    }
  }, [entityAPIRequestStatus]);

  return <UserFundingEntityContext.Provider value={fundingEntityData}>{children}</UserFundingEntityContext.Provider>;
}
