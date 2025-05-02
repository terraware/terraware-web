import React, { useEffect } from 'react';
import { matchPath } from 'react-router';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';

import { APP_PATHS } from 'src/constants';
import { useOrganization, useUserFundingEntity } from 'src/providers';
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

  useEffect(() => {
    if (userFundingEntity && !MINIMAL_FUNDER_ROUTES.some((path) => !!matchPath(path, location.pathname))) {
      navigate(APP_PATHS.FUNDER_HOME);
    }
    if (
      organizations?.length === 0 &&
      !MINIMAL_USER_ROUTES.some((path) => !!matchPath(path, location.pathname)) &&
      !userFundingEntity
    ) {
      navigate(APP_PATHS.WELCOME);
    }
  }, [navigate, location, userFundingEntity, organizations]);

  return organizations.length === 0 ? <NoOrgRouter /> : <OrgRouter {...props} />;
}
