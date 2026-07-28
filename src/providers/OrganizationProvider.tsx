import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useGetUserPreferencesQuery } from 'src/queries/generated/preferences';
import { store } from 'src/redux/store';
import { CachedUserService, OrganizationService } from 'src/services';
import strings from 'src/strings';
import { Organization } from 'src/types/Organization';
import useEnvironment from 'src/utils/useEnvironment';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import { PreferencesType, ProvidedOrganizationData } from './DataTypes';
import { OrganizationContext } from './contexts';
import { useUser } from './hooks';

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
  const [selectedOrganization, setSelectedOrganization] = useState<Organization>();
  const [orgAPIRequestStatus, setOrgAPIRequestStatus] = useState<APIRequestStatus>(APIRequestStatus.AWAITING);
  const [organizations, setOrganizations] = useState<Organization[]>();
  const navigate = useSyncNavigate();
  const query = useQuery();
  const location = useStateLocation();
  const { user, userPreferences, updateUserPreferences, bootstrapped: userBootstrapped } = useUser();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { isDev, isStaging } = useEnvironment();

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
      } else if (response.error === 'NotAuthenticated') {
        setOrgAPIRequestStatus(APIRequestStatus.FAILED_NO_AUTH);
      } else {
        // eslint-disable-next-line no-console
        console.error('Failed org fetch', response);
        setOrgAPIRequestStatus(APIRequestStatus.FAILED);
      }
    };

    await populateOrganizations();
  }, []);

  // Subscribe to the selected org's preferences rather than mirroring them into local state. Writes
  // invalidate the Preferences tag, so the refetch flows back through this subscription on its own —
  // no manual reload, and no window where a caller can observe a stale snapshot.
  const {
    currentData: orgPreferencesData,
    isSuccess: orgPreferencesLoaded,
    isError: orgPreferencesFailed,
  } = useGetUserPreferencesQuery(selectedOrganization?.id, { skip: !selectedOrganization });

  const orgPreferences = useMemo<PreferencesType>(() => orgPreferencesData?.preferences ?? {}, [orgPreferencesData]);

  useEffect(() => {
    // TODO: remove after org preferences readers are served from the RTK store
    if (selectedOrganization && orgPreferencesData) {
      CachedUserService.setUserOrgPreferences(selectedOrganization.id, orgPreferencesData.preferences ?? {});
    }
  }, [selectedOrganization, orgPreferencesData]);

  // Bootstrapped once the org's preferences resolve (or fail), or immediately when there is no org to
  // load them for (such as orphaned users). AppBootstrap latches this, so it needn't be latched here.
  const bootstrapped = organizations?.length === 0 || orgPreferencesLoaded || orgPreferencesFailed;

  const redirectAndNotify = useCallback(
    (organization: Organization) => {
      navigate({ pathname: APP_PATHS.HOME, search: `organizationId=${organization.id}&newOrg=true` });
    },
    [navigate]
  );

  useEffect(() => {
    void reloadOrganizations();
  }, [reloadOrganizations]);

  useEffect(() => {
    setOrganizationData((prev) => ({
      ...prev,
      redirectAndNotify,
      selectedOrganization,
      organizations: organizations ?? [],
      orgPreferences,
      bootstrapped,
    }));
  }, [selectedOrganization, organizations, orgPreferences, bootstrapped, redirectAndNotify]);

  useEffect(() => {
    if (userBootstrapped && userPreferences && organizations && !isAcceleratorRoute && user?.userType !== 'Funder') {
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
            navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
          }
        }
      }

      if (queryOrganizationId && (!orgToUse || isAcceleratorRoute)) {
        // user does not belong to any orgs, clear the url param org id
        query.delete('organizationId');
        navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
      }
    }
  }, [
    organizations,
    selectedOrganization,
    query,
    location,
    navigate,
    userPreferences,
    userBootstrapped,
    isAcceleratorRoute,
    user?.userType,
  ]);

  useEffect(() => {
    if (selectedOrganization?.id && userPreferences.lastVisitedOrg !== selectedOrganization.id) {
      void updateUserPreferences({ lastVisitedOrg: selectedOrganization.id });
    }
  }, [selectedOrganization?.id, updateUserPreferences, userPreferences.lastVisitedOrg]);

  useEffect(() => {
    // Reset the feature (redux) slices when the org changes.
    store.dispatch({ type: 'RESET_APP' });
  }, [selectedOrganization?.id]);

  useEffect(() => {
    if (orgAPIRequestStatus === APIRequestStatus.FAILED) {
      if (isDev || isStaging) {
        if (confirm(strings.DEV_SERVER_ERROR)) {
          window.location.reload();
        }
      } else {
        navigate(APP_PATHS.ERROR_FAILED_TO_FETCH_ORG_DATA);
      }
    }
  }, [orgAPIRequestStatus, isDev, isStaging, navigate]);

  const [organizationData, setOrganizationData] = useState<ProvidedOrganizationData>({
    selectedOrganization,
    setSelectedOrganization,
    organizations: organizations ?? [],
    orgPreferences,
    redirectAndNotify,
    reloadOrganizations,
    bootstrapped,
  });

  return <OrganizationContext.Provider value={organizationData}>{children}</OrganizationContext.Provider>;
}
