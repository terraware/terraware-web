import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useListOrganizationsQuery } from 'src/queries/generated/organizations';
import { useGetUserPreferencesQuery } from 'src/queries/generated/preferences';
import { store } from 'src/redux/store';
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

export default function OrganizationProvider({ children }: OrganizationProviderProps): JSX.Element {
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number>();
  const navigate = useSyncNavigate();
  const query = useQuery();
  const location = useStateLocation();
  const { user, userPreferences, updateUserPreferences, bootstrapped: userBootstrapped } = useUser();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { isDev, isStaging } = useEnvironment();

  const {
    currentData: organizationsData,
    error: organizationsError,
    isFetching: isFetchingOrganizations,
    refetch: refetchOrganizations,
  } = useListOrganizationsQuery('Facility');
  const organizations = organizationsData?.organizations;
  const organizationsFailed =
    organizationsError !== undefined && !('status' in organizationsError && organizationsError.status === 401);

  const selectedOrganization = useMemo(
    () => organizations?.find((organization) => organization.id === selectedOrganizationId),
    [organizations, selectedOrganizationId]
  );

  const setSelectedOrganization = useCallback((organization: Organization) => {
    setSelectedOrganizationId(organization.id);
  }, []);

  const reloadOrganizations = useCallback(
    async (selectedOrgId?: number) => {
      const { data } = await refetchOrganizations();
      if (selectedOrgId && data?.organizations.some((organization) => organization.id === selectedOrgId)) {
        setSelectedOrganizationId(selectedOrgId);
      }
    },
    [refetchOrganizations]
  );

  // Subscribe to the selected org's preferences rather than mirroring them into local state. Writes
  // invalidate the Preferences tag, so the refetch flows back through this subscription on its own —
  // no manual reload, and no window where a caller can observe a stale snapshot.
  const {
    currentData: orgPreferencesData,
    isSuccess: orgPreferencesLoaded,
    isError: orgPreferencesFailed,
  } = useGetUserPreferencesQuery(selectedOrganization?.id, { skip: !selectedOrganization });

  const orgPreferences = useMemo<PreferencesType>(() => orgPreferencesData?.preferences ?? {}, [orgPreferencesData]);

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
    if (userBootstrapped && userPreferences && organizations && !isAcceleratorRoute && user?.userType !== 'Funder') {
      const queryOrganizationId = query.get('organizationId');
      let orgToUse;
      if (organizations.length) {
        const querySelectionOrg =
          queryOrganizationId && organizations.find((org) => org.id === parseInt(queryOrganizationId, 10));
        if (queryOrganizationId && !querySelectionOrg && isFetchingOrganizations) {
          // a just-created org isn't in the stale list yet; don't overwrite the URL before the refetch lands
          return;
        }
        orgToUse = querySelectionOrg || organizations.find((org) => org.id === selectedOrganization?.id);
        if (!orgToUse && userPreferences.lastVisitedOrg) {
          orgToUse = organizations.find((org) => org.id === userPreferences.lastVisitedOrg);
        }
        if (!orgToUse) {
          orgToUse = organizations[0];
        }
        if (orgToUse) {
          if (selectedOrganization?.id !== orgToUse.id) {
            setSelectedOrganizationId(orgToUse.id);
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
    isFetchingOrganizations,
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
    if (organizationsFailed) {
      if (isDev || isStaging) {
        if (confirm(strings.DEV_SERVER_ERROR)) {
          window.location.reload();
        }
      } else {
        navigate(APP_PATHS.ERROR_FAILED_TO_FETCH_ORG_DATA);
      }
    }
  }, [organizationsFailed, isDev, isStaging, navigate]);

  const organizationData = useMemo<ProvidedOrganizationData>(
    () => ({
      selectedOrganization,
      setSelectedOrganization,
      organizations: organizations ?? [],
      orgPreferences,
      redirectAndNotify,
      reloadOrganizations,
      bootstrapped,
    }),
    [
      selectedOrganization,
      setSelectedOrganization,
      organizations,
      orgPreferences,
      redirectAndNotify,
      reloadOrganizations,
      bootstrapped,
    ]
  );

  return <OrganizationContext.Provider value={organizationData}>{children}</OrganizationContext.Provider>;
}
