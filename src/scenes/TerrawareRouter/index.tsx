import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import NoOrgRouter from "src/scenes/NoOrgRouter";
import OrgRouter from 'src/scenes/OrgRouter';
import useStateLocation from 'src/utils/useStateLocation';

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
  const history = useHistory();
  const location = useStateLocation();
  
   useEffect(() => {
    if (organizations?.length === 0 && MINIMAL_USER_ROUTES.indexOf(location.pathname) === -1) {
      history.push(APP_PATHS.WELCOME);
    }
  }, [history, location, organizations]);

  return organizations.length === 0 ? <NoOrgRouter /> : <OrgRouter  {...props} />;
}