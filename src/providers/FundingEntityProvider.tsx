import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { APP_PATHS } from 'src/constants';
import { requestFundingEntity } from 'src/redux/features/funder/fundingEntitiesAsyncThunks';
import { selectFundingEntityRequest } from 'src/redux/features/funder/fundingEntitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import useEnvironment from 'src/utils/useEnvironment';

import { ProvidedFundingEntityData } from './DataTypes';
import { FundingEntityContext } from './contexts';

export type FundingEntityProviderProps = {
  children?: React.ReactNode;
};

enum APIRequestStatus {
  'AWAITING',
  'FAILED',
  'SUCCEEDED',
}

export default function FundingEntityProvider({ children }: FundingEntityProviderProps) {
  const pathParams = useParams<{ fundingEntityId: string }>();
  const pathFundingEntityId = Number(pathParams.fundingEntityId);
  const dispatch = useAppDispatch();
  const [entityAPIRequestStatus, setEntityAPIRequestStatus] = useState<APIRequestStatus>(APIRequestStatus.AWAITING);
  const navigate = useNavigate();
  const { isDev, isStaging } = useEnvironment();
  const getFundingEntityRequest = useAppSelector(selectFundingEntityRequest(pathFundingEntityId));
  const [fundingEntityData, setFundingEntityData] = useState<ProvidedFundingEntityData>({
    fundingEntity: undefined,
    reload: () => {
      // default no-op implementation
      return;
    },
  });

  const pathParamExists = () => !isNaN(pathFundingEntityId) && pathFundingEntityId !== -1;

  const reload = useCallback(() => {
    if (pathParamExists()) {
      void dispatch(requestFundingEntity(pathFundingEntityId));
    }
  }, [dispatch, pathFundingEntityId]);

  useEffect(() => {
    if (pathParamExists()) {
      void dispatch(requestFundingEntity(pathFundingEntityId));
    }
  }, [pathFundingEntityId, dispatch]);

  useEffect(() => {
    if (!pathParamExists() || !getFundingEntityRequest) {
      return;
    }

    if (getFundingEntityRequest.status === 'success' && getFundingEntityRequest.data) {
      setEntityAPIRequestStatus(APIRequestStatus.SUCCEEDED);
      setFundingEntityData({
        fundingEntity: getFundingEntityRequest.data.fundingEntity,
        reload,
      });
    } else if (getFundingEntityRequest.status === 'error') {
      setEntityAPIRequestStatus(APIRequestStatus.FAILED);
    }
  }, [pathFundingEntityId, getFundingEntityRequest, reload]);

  useEffect(() => {
    if (entityAPIRequestStatus === APIRequestStatus.FAILED) {
      if (isDev || isStaging) {
        if (confirm(strings.DEV_SERVER_ERROR)) {
          window.location.reload();
        }
      } else {
        void navigate(APP_PATHS.ERROR_FAILED_TO_FETCH_ORG_DATA);
      }
    }
  }, [entityAPIRequestStatus]);

  return <FundingEntityContext.Provider value={fundingEntityData}>{children}</FundingEntityContext.Provider>;
}
