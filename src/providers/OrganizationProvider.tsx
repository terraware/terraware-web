import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { APP_PATHS } from 'src/constants';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { getOrganizations } from 'src/api/organization/organization';
import { getPreferences, updatePreferences } from 'src/api/preferences/preferences';
import { ServerOrganization } from 'src/types/Organization';
import { OrganizationContext } from './contexts';
import { ProvidedOrganizationData } from './DataTypes';
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
  const [selectedOrganization, setSelectedOrganization] = useState<ServerOrganization>();
  const [preferencesOrg, setPreferencesOrg] = useState<{ [key: string]: unknown }>();
  const [orgScopedPreferences, setOrgScopedPreferences] = useState<{ [key: string]: unknown }>();
  const [orgAPIRequestStatus, setOrgAPIRequestStatus] = useState<APIRequestStatus>(APIRequestStatus.AWAITING);
  const [organizations, setOrganizations] = useState<ServerOrganization[]>([]);
  const history = useHistory();
  const query = useQuery();
  const location = useStateLocation();

  const reloadData = useCallback(async (selectedOrgId?: number) => {
    const populateOrganizations = async () => {
      const response = await getOrganizations();
      if (!response.error) {
        setOrgAPIRequestStatus(APIRequestStatus.SUCCEEDED);
        setOrganizations(response.organizations);
        if (selectedOrgId) {
          const orgToSelect = response.organizations.find((org) => org.id === selectedOrgId);
          if (orgToSelect) {
            setSelectedOrganization(orgToSelect);
            updatePreferences('lastVisitedOrg', orgToSelect.id);
          }
        }
        setBootstrapped(true);
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
      const response = await getPreferences();
      if (organizations && response.requestSucceeded) {
        setPreferencesOrg(response.preferences);
      }
    };
    getUserPreferences();
  }, [organizations, setPreferencesOrg]);

  const [organizationData, setOrganizationData] = useState<ProvidedOrganizationData>({
    selectedOrganization: selectedOrganization || defaultSelectedOrg,
    setSelectedOrganization,
    organizations,
    orgScopedPreferences,
    reloadData,
    reloadPreferences,
    bootstrapped,
  });

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  useEffect(() => {
    setOrganizationData((prev) => ({
      ...prev,
      selectedOrganization: selectedOrganization || defaultSelectedOrg,
      organizations,
      orgScopedPreferences,
      bootstrapped,
    }));
  }, [selectedOrganization, organizations, orgScopedPreferences, bootstrapped]);

  const reloadOrgPreferences = useCallback(() => {
    const getOrgPreferences = async () => {
      if (selectedOrganization) {
        const response = await getPreferences(selectedOrganization.id);
        if (response.requestSucceeded) {
          setOrgScopedPreferences(response.preferences);
        }
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
    if (organizations && preferencesOrg) {
      const organizationId = query.get('organizationId');
      const querySelectionOrg = organizationId && organizations.find((org) => org.id === parseInt(organizationId, 10));
      setSelectedOrganization((previouslySelectedOrg: ServerOrganization | undefined) => {
        let orgToUse = querySelectionOrg || organizations.find((org) => org.id === previouslySelectedOrg?.id);
        if (!orgToUse && preferencesOrg.lastVisitedOrg) {
          orgToUse = organizations.find((org) => org.id === preferencesOrg.lastVisitedOrg);
        }
        if (!orgToUse) {
          orgToUse = organizations[0];
        }
        if (orgToUse && preferencesOrg?.lastVisitedOrg !== orgToUse.id) {
          updatePreferences('lastVisitedOrg', orgToUse.id);
        }
        return orgToUse;
      });
      if (organizationId) {
        query.delete('organizationId');
        // preserve other url params
        history.push(getLocation(location.pathname, location, query.toString()));
      }
    }
  }, [organizations, selectedOrganization, query, location, history, preferencesOrg]);

  if (orgAPIRequestStatus === APIRequestStatus.FAILED) {
    history.push(APP_PATHS.ERROR_FAILED_TO_FETCH_ORG_DATA);
  }

  return <OrganizationContext.Provider value={organizationData}>{children}</OrganizationContext.Provider>;
}
