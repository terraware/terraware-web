import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { requestFundingEntity } from 'src/redux/features/funder/fundingEntitiesAsyncThunks';
import { selectFundingEntityRequest } from 'src/redux/features/funder/fundingEntitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import useEnvironment from 'src/utils/useEnvironment';

import { ProvidedFundingEntityData } from './DataTypes';
import { FundingEntityContext } from './contexts';
import { useUser } from './hooks';

export type FundingEntityProviderProps = {
  children?: React.ReactNode;
};

enum APIRequestStatus {
  'AWAITING',
  'FAILED',
  'SUCCEEDED',
}

export default function FundingEntityProvider({ children }: FundingEntityProviderProps) {
  const { user, bootstrapped: userBootstrapped } = useUser();
  const dispatch = useAppDispatch();
  const [entityAPIRequestStatus, setEntityAPIRequestStatus] = useState<APIRequestStatus>(APIRequestStatus.AWAITING);
  const navigate = useNavigate();
  const { isDev, isStaging } = useEnvironment();
  const getFundingEntityRequest = useAppSelector(selectFundingEntityRequest(user?.id));
  const [fundingEntityData, setFundingEntityData] = useState<ProvidedFundingEntityData>({
    fundingEntity: undefined,
    bootstrapped: false,
  });

  useEffect(() => {
    if (userBootstrapped && user && user.userType === 'Funder') {
      dispatch(requestFundingEntity(user.id));
    }
  }, [userBootstrapped, user, dispatch]);

  useEffect(() => {
    if (!getFundingEntityRequest) {
      return;
    }

    if (getFundingEntityRequest.status === 'success' && getFundingEntityRequest && getFundingEntityRequest.data) {
      setEntityAPIRequestStatus(APIRequestStatus.SUCCEEDED);
      setFundingEntityData({
        fundingEntity: getFundingEntityRequest.data.fundingEntity,
        bootstrapped: true,
      });
    } else if (getFundingEntityRequest.status === 'error') {
      setEntityAPIRequestStatus(APIRequestStatus.FAILED);
    }
  }, [getFundingEntityRequest]);

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

  return <FundingEntityContext.Provider value={fundingEntityData}>{children}</FundingEntityContext.Provider>;
}
