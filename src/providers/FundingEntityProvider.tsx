import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { requestFundingEntity } from 'src/redux/features/funder/entities/fundingEntitiesAsyncThunks';
import { selectFundingEntityRequest } from 'src/redux/features/funder/entities/fundingEntitiesSelectors';
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
  const navigate = useSyncNavigate();
  const { isDev, isStaging } = useEnvironment();
  const isRtkQueryEnabled = isEnabled('Redux RTK Query');
  const getFundingEntityRequest = useAppSelector(selectFundingEntityRequest(pathFundingEntityId));
  const [fundingEntityData, setFundingEntityData] = useState<ProvidedFundingEntityData>({
    fundingEntity: undefined,
    reload: () => {
      // default no-op implementation
      return;
    },
  });

  const pathParamExists = useMemo(
    () => !isNaN(pathFundingEntityId) && pathFundingEntityId !== -1,
    [pathFundingEntityId]
  );

  const reload = useCallback(() => {
    if (!isRtkQueryEnabled && pathParamExists) {
      void dispatch(requestFundingEntity(pathFundingEntityId));
    }
  }, [dispatch, isRtkQueryEnabled, pathFundingEntityId, pathParamExists]);

  useEffect(() => {
    if (!isRtkQueryEnabled && pathParamExists) {
      void dispatch(requestFundingEntity(pathFundingEntityId));
    }
  }, [pathFundingEntityId, dispatch, pathParamExists, isRtkQueryEnabled]);

  useEffect(() => {
    if (!pathParamExists || !getFundingEntityRequest) {
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
  }, [pathFundingEntityId, getFundingEntityRequest, reload, pathParamExists]);

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
  }, [entityAPIRequestStatus, isDev, isStaging, navigate]);

  return <FundingEntityContext.Provider value={fundingEntityData}>{children}</FundingEntityContext.Provider>;
}
