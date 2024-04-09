import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import useStateLocation from 'src/utils/useStateLocation';

const OrgRouter = React.lazy(() => import('src/scenes/OrgRouter'));
const NoOrgRouter = React.lazy(() => import('src/scenes/NoOrgRouter'));

interface TerrawareRouterProps {
  showNavBar: boolean;
  setShowNavBar: (value: boolean) => void;
}

const MINIMAL_USER_ROUTES: string[] = [
  APP_PATHS.WELCOME,
  APP_PATHS.MY_ACCOUNT,
  APP_PATHS.MY_ACCOUNT_EDIT,
  APP_PATHS.OPT_IN,
];

export default function TerrawareRouter(props: TerrawareRouterProps) {
  const { organizations } = useOrganization();
  const navigate = useNavigate();
  const location = useStateLocation();

  useEffect(() => {
    if (organizations?.length === 0 && MINIMAL_USER_ROUTES.indexOf(location.pathname) === -1) {
      navigate(APP_PATHS.WELCOME);
    }
  }, [navigate, location, organizations]);

  return organizations.length === 0 ? <NoOrgRouter /> : <OrgRouter {...props} />;
}
