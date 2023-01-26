import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { APP_PATHS } from 'src/constants';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { OrganizationService, PreferencesService } from 'src/services';
import { Organization } from 'src/types/Organization';
import { OrganizationContext } from './contexts';
import { PreferencesType, ProvidedOrganizationData } from './DataTypes';
import { defaultSelectedOrg } from './contexts';

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
  const [userPreferences, setUserPreferences] = useState<PreferencesType>({});
  const [orgPreferences, setOrgPreferences] = useState<PreferencesType>({});
  const [orgPreferenceForId, setOrgPreferenceForId] = useState<number>(defaultSelectedOrg.id);
  const [orgAPIRequestStatus, setOrgAPIRequestStatus] = useState<APIRequestStatus>(APIRequestStatus.AWAITING);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const history = useHistory();
  const query = useQuery();
  const location = useStateLocation();

  const reloadData = useCallback(async (selectedOrgId?: number) => {
    const populateOrganizations = async () => {
      const response = await OrganizationService.getOrganizations();
      if (!response.error) {
        setOrgAPIRequestStatus(APIRequestStatus.SUCCEEDED);
        setOrganizations(response.organizations);
        if (selectedOrgId) {
          const orgToSelect = response.organizations.find((org) => org.id === selectedOrgId);
          if (orgToSelect) {
            setSelectedOrganization(orgToSelect);
            PreferencesService.updateUserPreferences({ lastVisitedOrg: orgToSelect.id });
          }
        }
        if (response.organizations.length === 0) {
          // if we don't need to retrieve org preferences (such as for orphaned users), mark as bootstrapped
          setBootstrapped(true);
        }
      } else if (response.error === 'NotAuthenticated') {
        setOrgAPIRequestStatus(APIRequestStatus.FAILED_NO_AUTH);
      } else {
        setOrgAPIRequestStatus(APIRequestStatus.FAILED);
      }
    };
    await populateOrganizations();
  }, []);

  const reloadPreferences = useCallback(() => {
    const getUserPreferences = async () => {
      const response = await PreferencesService.getUserPreferences();
      if (response.requestSucceeded && response.preferences) {
        setUserPreferences(response.preferences);
      }
    };
    getUserPreferences();
  }, [setUserPreferences]);

  const [organizationData, setOrganizationData] = useState<ProvidedOrganizationData>({
    selectedOrganization: selectedOrganization || defaultSelectedOrg,
    setSelectedOrganization,
    organizations,
    userPreferences,
    orgPreferences,
    reloadData,
    reloadPreferences,
    bootstrapped,
    orgPreferenceForId,
  });

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  useEffect(() => {
    setOrganizationData((prev) => ({
      ...prev,
      selectedOrganization: selectedOrganization || defaultSelectedOrg,
      organizations,
      orgPreferences,
      userPreferences,
      bootstrapped,
      orgPreferenceForId,
    }));
  }, [selectedOrganization, organizations, orgPreferences, userPreferences, bootstrapped, orgPreferenceForId]);

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
    reloadPreferences();
  }, [reloadPreferences]);

  useEffect(() => {
    reloadOrgPreferences();
  }, [reloadOrgPreferences, selectedOrganization]);

  useEffect(() => {
    if (organizations.length && userPreferences) {
      const organizationId = query.get('organizationId');
      const querySelectionOrg = organizationId && organizations.find((org) => org.id === parseInt(organizationId, 10));
      setSelectedOrganization((previouslySelectedOrg: Organization | undefined) => {
        let orgToUse = querySelectionOrg || organizations.find((org) => org.id === previouslySelectedOrg?.id);
        if (!orgToUse && userPreferences.lastVisitedOrg) {
          orgToUse = organizations.find((org) => org.id === userPreferences.lastVisitedOrg);
        }
        if (!orgToUse) {
          orgToUse = organizations[0];
        }
        if (orgToUse && userPreferences?.lastVisitedOrg !== orgToUse.id) {
          PreferencesService.updateUserPreferences({ lastVisitedOrg: orgToUse.id });
        }
        return orgToUse;
      });
      if (organizationId) {
        query.delete('organizationId');
        // preserve other url params
        history.push(getLocation(location.pathname, location, query.toString()));
      }
    }
  }, [organizations, selectedOrganization, query, location, history, userPreferences]);

  if (orgAPIRequestStatus === APIRequestStatus.FAILED) {
    history.push(APP_PATHS.ERROR_FAILED_TO_FETCH_ORG_DATA);
  }

  return <OrganizationContext.Provider value={organizationData}>{children}</OrganizationContext.Provider>;
}
