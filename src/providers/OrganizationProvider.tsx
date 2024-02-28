import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { APP_PATHS } from 'src/constants';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { OrganizationService, PreferencesService } from 'src/services';
import { Organization } from 'src/types/Organization';
import { OrganizationContext } from './contexts';
import { PreferencesType, ProvidedOrganizationData } from './DataTypes';
import { defaultSelectedOrg } from './contexts';
import { useUser } from './hooks';
import { store } from 'src/redux/store';

export type OrganizationProviderProps = {
  children?: React.ReactNode;
};

enum APIRequestStatus {
  'AWAITING',
  'FAILED',
  'FAILED_NO_AUTH',
  'SUCCEEDED',
}

export default function OrganizationProvider({ children }: OrganizationProviderProps): JSX.Element {
  const [bootstrapped, setBootstrapped] = useState<boolean>(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization>();
  const [orgPreferences, setOrgPreferences] = useState<PreferencesType>({});
  const [orgPreferenceForId, setOrgPreferenceForId] = useState<number>(defaultSelectedOrg.id);
  const [orgAPIRequestStatus, setOrgAPIRequestStatus] = useState<APIRequestStatus>(APIRequestStatus.AWAITING);
  const [organizations, setOrganizations] = useState<Organization[]>();
  const history = useHistory();
  const query = useQuery();
  const location = useStateLocation();
  const { userPreferences, updateUserPreferences, bootstrapped: userBootstrapped } = useUser();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const reloadOrganizations = useCallback(async (selectedOrgId?: number) => {
    const populateOrganizations = async () => {
      const response = await OrganizationService.getOrganizations();
      if (!response.error) {
        setOrgAPIRequestStatus(APIRequestStatus.SUCCEEDED);
        setOrganizations(response.organizations);
        if (selectedOrgId) {
          const orgToSelect = response.organizations.find((org) => org.id === selectedOrgId);
          if (orgToSelect) {
            setSelectedOrganization(orgToSelect);
          }
        }
        if (response.organizations.length === 0) {
          // if we don't need to retrieve org preferences (such as for orphaned users), mark as bootstrapped
          setBootstrapped(true);
        }
      } else if (response.error === 'NotAuthenticated') {
        setOrgAPIRequestStatus(APIRequestStatus.FAILED_NO_AUTH);
      } else {
        // tslint:disable-next-line: no-console
        console.error('Failed org fetch', response);
        setOrgAPIRequestStatus(APIRequestStatus.FAILED);
      }
    };

    await populateOrganizations();
  }, []);

  const reloadOrgPreferences = useCallback(() => {
    const getOrgPreferences = async () => {
      if (selectedOrganization) {
        const response = await PreferencesService.getUserOrgPreferences(selectedOrganization.id);
        if (response.requestSucceeded && response.preferences) {
          setOrgPreferences(response.preferences);
          setOrgPreferenceForId(selectedOrganization.id);
        }
        // once we retrieve the org and it's preferences, we are now bootstrapped for the organization provider
        setBootstrapped(true);
      }
    };

    getOrgPreferences();
  }, [selectedOrganization]);

  useEffect(() => {
    reloadOrganizations();
  }, [reloadOrganizations]);

  useEffect(() => {
    setOrganizationData((prev) => ({
      ...prev,
      selectedOrganization: selectedOrganization || defaultSelectedOrg,
      organizations: organizations ?? [],
      orgPreferences,
      bootstrapped,
      orgPreferenceForId,
      reloadOrgPreferences,
    }));
  }, [selectedOrganization, organizations, orgPreferences, bootstrapped, orgPreferenceForId, reloadOrgPreferences]);

  useEffect(() => {
    reloadOrgPreferences();
  }, [reloadOrgPreferences]);

  useEffect(() => {
    if (userBootstrapped && userPreferences && organizations && !isAcceleratorRoute) {
      const queryOrganizationId = query.get('organizationId');
      let orgToUse;
      if (organizations.length) {
        const querySelectionOrg =
          queryOrganizationId && organizations.find((org) => org.id === parseInt(queryOrganizationId, 10));
        orgToUse = querySelectionOrg || organizations.find((org) => org.id === selectedOrganization?.id);
        if (!orgToUse && userPreferences.lastVisitedOrg) {
          orgToUse = organizations.find((org) => org.id === userPreferences.lastVisitedOrg);
        }
        if (!orgToUse) {
          orgToUse = organizations[0];
        }
        if (orgToUse) {
          if (selectedOrganization?.id !== orgToUse.id) {
            setSelectedOrganization(orgToUse);
          }
          if (queryOrganizationId !== orgToUse.id.toString()) {
            query.set('organizationId', orgToUse.id.toString());
            history.replace(getLocation(location.pathname, location, query.toString()));
          }
        }
      }

      if (queryOrganizationId && (!orgToUse || isAcceleratorRoute)) {
        // user does not belong to any orgs, clear the url param org id
        query.delete('organizationId');
        history.replace(getLocation(location.pathname, location, query.toString()));
      }
    }
  }, [
    organizations,
    selectedOrganization,
    query,
    location,
    history,
    userPreferences,
    userBootstrapped,
    isAcceleratorRoute,
  ]);

  useEffect(() => {
    if (selectedOrganization?.id && userPreferences.lastVisitedOrg !== selectedOrganization.id) {
      updateUserPreferences({ lastVisitedOrg: selectedOrganization.id });
    }
  }, [selectedOrganization?.id, updateUserPreferences, userPreferences.lastVisitedOrg]);

  useEffect(() => {
    // reset redux store when org changes
    store.dispatch({ type: 'RESET_APP' });
  }, [selectedOrganization?.id]);

  if (orgAPIRequestStatus === APIRequestStatus.FAILED) {
    history.push(APP_PATHS.ERROR_FAILED_TO_FETCH_ORG_DATA);
  }

  const [organizationData, setOrganizationData] = useState<ProvidedOrganizationData>({
    selectedOrganization: selectedOrganization || defaultSelectedOrg,
    setSelectedOrganization,
    organizations: organizations ?? [],
    orgPreferences,
    reloadOrganizations,
    reloadOrgPreferences,
    bootstrapped,
    orgPreferenceForId,
  });

  return <OrganizationContext.Provider value={organizationData}>{children}</OrganizationContext.Provider>;
}
