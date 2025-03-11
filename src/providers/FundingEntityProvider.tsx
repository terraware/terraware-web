import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import FundingEntityService from 'src/services/FundingEntityService';
import strings from 'src/strings';
import { FundingEntity } from 'src/types/FundingEntity';
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
  'FAILED_NO_AUTH',
  'SUCCEEDED',
}
export default function FundingEntityProvider({ children }: FundingEntityProviderProps) {
  const { user, bootstrapped: userBootstrapped } = useUser();
  const [fundingEntity, setFundingEntity] = useState<FundingEntity | undefined | null>();
  const [entityAPIRequestStatus, setEntityAPIRequestStatus] = useState<APIRequestStatus>(APIRequestStatus.AWAITING);
  const navigate = useNavigate();
  const { isDev, isStaging } = useEnvironment();

  const populateFundingEntity = useCallback(async (userId: number) => {
    const response = await FundingEntityService.getUserFundingEntity(userId);
    if (!response.error) {
      setEntityAPIRequestStatus(APIRequestStatus.SUCCEEDED);
      setFundingEntity(response.fundingEntity);
    } else if (response.error === 'NotAuthenticated') {
      setEntityAPIRequestStatus(APIRequestStatus.FAILED_NO_AUTH);
    } else {
      // eslint-disable-next-line no-console
      console.error('Failed funding entity fetch', response);
      setEntityAPIRequestStatus(APIRequestStatus.FAILED);
    }
  }, []);

  useEffect(() => {
    if (userBootstrapped && user && !fundingEntity && populateFundingEntity) {
      if (user.userType === 'Funder') {
        populateFundingEntity(user.id);
      } else {
        setFundingEntity(null);
      }
    } else if (fundingEntity) {
      setFundingEntityData({
        fundingEntity,
        bootstrapped: true,
      });
    }
  }, [userBootstrapped, fundingEntity, setFundingEntity, populateFundingEntity]);

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

  useEffect(() => {}, [fundingEntity, setFundingEntity]);

  const [fundingEntityData, setFundingEntityData] = useState<ProvidedFundingEntityData>({
    fundingEntity: fundingEntity || undefined,
    bootstrapped: fundingEntity !== undefined,
  });
  return <FundingEntityContext.Provider value={fundingEntityData}>{children}</FundingEntityContext.Provider>;
}
