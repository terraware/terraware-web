import React, { useEffect, useState } from 'react';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLazyGetFundingEntity1Query } from 'src/queries/generated/fundingEntities';
import strings from 'src/strings';
import useEnvironment from 'src/utils/useEnvironment';

import { ProvidedUserFundingEntityData } from './DataTypes';
import { UserFundingEntityContext } from './contexts';
import { useUser } from './hooks';

export type UserFundingEntityProviderProps = {
  children?: React.ReactNode;
};

export default function UserFundingEntityProvider({ children }: UserFundingEntityProviderProps) {
  const { user, bootstrapped: userBootstrapped } = useUser();
  const navigate = useSyncNavigate();
  const { isDev, isStaging } = useEnvironment();
  const [getUserFundingEntity, result] = useLazyGetFundingEntity1Query();
  const [fundingEntityData, setFundingEntityData] = useState<ProvidedUserFundingEntityData>({
    userFundingEntity: undefined,
    bootstrapped: false,
  });

  useEffect(() => {
    if (userBootstrapped && user && user.userType === 'Funder') {
      void getUserFundingEntity({ userId: user.id });
    }
  }, [userBootstrapped, user, getUserFundingEntity]);

  useEffect(() => {
    if (result.isSuccess && result.data) {
      setFundingEntityData({
        userFundingEntity: result.data.fundingEntity,
        bootstrapped: true,
      });
    }
  }, [result]);

  useEffect(() => {
    if (result.isError) {
      if (isDev || isStaging) {
        if (confirm(strings.DEV_SERVER_ERROR)) {
          window.location.reload();
        }
      } else {
        navigate(APP_PATHS.ERROR_FAILED_TO_FETCH_ORG_DATA);
      }
    }
  }, [result, isDev, isStaging, navigate]);

  return <UserFundingEntityContext.Provider value={fundingEntityData}>{children}</UserFundingEntityContext.Provider>;
}
