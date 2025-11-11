import React, { useEffect, useMemo } from 'react';
import { matchPath } from 'react-router';

import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization, useUser, useUserFundingEntity } from 'src/providers';
import { useLazyGetUserFundingEntityQuery } from 'src/queries/funder/fundingEntities';
import NoOrgRouter from 'src/scenes/NoOrgRouter';
import OrgRouter from 'src/scenes/OrgRouter';
import useStateLocation from 'src/utils/useStateLocation';

interface TerrawareRouterProps {
  showNavBar: boolean;
  setShowNavBar: (value: boolean) => void;
}

const MINIMAL_USER_ROUTES: string[] = [
  APP_PATHS.HOME,
  APP_PATHS.APPLICATIONS,
  APP_PATHS.WELCOME,
  APP_PATHS.SETTINGS,
  APP_PATHS.MY_ACCOUNT,
  APP_PATHS.MY_ACCOUNT_EDIT,
  APP_PATHS.OPT_IN,
  APP_PATHS.HELP_SUPPORT,
  APP_PATHS.HELP_SUPPORT_FORM,
];

const MINIMAL_FUNDER_ROUTES: string[] = [
  APP_PATHS.FUNDER_HOME,
  APP_PATHS.SETTINGS,
  APP_PATHS.OPT_IN,
  APP_PATHS.HELP_SUPPORT,
  APP_PATHS.HELP_SUPPORT_FORM,
];

export default function TerrawareRouter(props: TerrawareRouterProps) {
  const { userFundingEntity } = useUserFundingEntity();
  const { organizations } = useOrganization();
  const navigate = useSyncNavigate();
  const location = useStateLocation();

  const { user } = useUser();
  const rtkQueryEnabled = isEnabled('Redux RTK Query');
  const [rtkGetUserFundingEntity, { data: rtkUserFundingEntity }] = useLazyGetUserFundingEntityQuery();
  useEffect(() => {
    if (rtkQueryEnabled && user) {
      void rtkGetUserFundingEntity(user.id);
    }
  }, [rtkGetUserFundingEntity, rtkQueryEnabled, user]);

  const fundingEntityToUse = useMemo(() => {
    if (rtkQueryEnabled) {
      return rtkUserFundingEntity;
    } else {
      return userFundingEntity;
    }
  }, [rtkQueryEnabled, rtkUserFundingEntity, userFundingEntity]);

  useEffect(() => {
    if (fundingEntityToUse && !MINIMAL_FUNDER_ROUTES.some((path) => !!matchPath(path, location.pathname))) {
      navigate(APP_PATHS.FUNDER_HOME);
    }
    if (
      organizations?.length === 0 &&
      !MINIMAL_USER_ROUTES.some((path) => !!matchPath(path, location.pathname)) &&
      !fundingEntityToUse
    ) {
      navigate(APP_PATHS.WELCOME);
    }
  }, [navigate, location, fundingEntityToUse, organizations]);

  return organizations.length === 0 ? <NoOrgRouter /> : <OrgRouter {...props} />;
}
