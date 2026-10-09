import React, { ReactNode, useCallback, useMemo, useState } from 'react';

import { skipToken } from '@reduxjs/toolkit/query';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useOrganization, useUser } from 'src/providers';
import {
  api,
  useGetApplicationDeliverablesQuery,
  useGetApplicationModulesQuery,
  useListApplicationsQuery,
} from 'src/queries/generated/applications';
import { store } from 'src/redux/store';
import { ApplicationDeliverable, ApplicationModule } from 'src/types/Application';
import { isAllowed } from 'src/utils/acl';

import { ApplicationContext, ApplicationData } from './Context';

type Props = {
  children?: ReactNode;
};

const NO_SECTIONS: ApplicationModule[] = [];
const NO_DELIVERABLES: ApplicationDeliverable[] = [];

type QueryStatusSelector = (state: ReturnType<typeof store.getState>) => { status: string };

// A mutation's tag invalidation starts its refetch outside of initiate(), so a refetch() issued after the mutation is
// deduped against it and resolves right away with the stale state. Watch the store until the queries settle instead.
const waitForQueriesToSettle = (selectors: QueryStatusSelector[]) =>
  new Promise<void>((resolve) => {
    const settled = () => selectors.every((select) => select(store.getState()).status !== 'pending');
    if (settled()) {
      resolve();
      return;
    }
    const unsubscribe = store.subscribe(() => {
      if (settled()) {
        unsubscribe();
        resolve();
      }
    });
  });

const ApplicationProvider = ({ children }: Props) => {
  const { selectedOrganization } = useOrganization();
  const { user } = useUser();
  const isAllowedAllApplications = useMemo(() => (user ? isAllowed(user, 'READ_ALL_APPLICATIONS') : false), [user]);
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const [selectedApplicationId, setSelectedApplicationId] = useState<number>();

  const organizationId = selectedOrganization?.id;
  const listArg = useMemo(() => {
    if (isAcceleratorRoute && isAllowedAllApplications) {
      return { listAll: true };
    }
    return organizationId !== undefined ? { organizationId, listAll: false } : skipToken;
  }, [isAcceleratorRoute, isAllowedAllApplications, organizationId]);
  const { currentData: applicationsData, refetch: refetchApplications } = useListApplicationsQuery(listArg);
  const allApplications = applicationsData?.applications;

  const selectedApplication = useMemo(
    () => allApplications?.find((application) => application.id === selectedApplicationId),
    [allApplications, selectedApplicationId]
  );

  const { currentData: modulesData, refetch: refetchModules } = useGetApplicationModulesQuery(
    selectedApplication?.id ?? skipToken
  );
  const { currentData: deliverablesData, refetch: refetchDeliverables } = useGetApplicationDeliverablesQuery(
    selectedApplication?.id ?? skipToken
  );

  const _setSelectedApplication = useCallback((applicationId: string | number) => {
    setSelectedApplicationId(Number(applicationId));
  }, []);

  const _reload = useCallback(
    async (onReload?: () => void) => {
      if (listArg === skipToken) {
        onReload?.();
        return true;
      }
      const listSelector = api.endpoints.listApplications.select(listArg);
      const selectors: QueryStatusSelector[] = [listSelector];
      void refetchApplications();
      if (selectedApplication) {
        selectors.push(
          api.endpoints.getApplicationModules.select(selectedApplication.id),
          api.endpoints.getApplicationDeliverables.select(selectedApplication.id)
        );
        void refetchModules();
        void refetchDeliverables();
      }
      await waitForQueriesToSettle(selectors);
      const succeeded = listSelector(store.getState()).isSuccess;
      if (succeeded) {
        onReload?.();
      }
      return succeeded;
    },
    [listArg, refetchApplications, refetchDeliverables, refetchModules, selectedApplication]
  );

  const _getApplicationByProjectId = useCallback(
    (projectId: number) => allApplications?.find((application) => application.projectId === projectId),
    [allApplications]
  );

  const applicationData = useMemo<ApplicationData>(
    () => ({
      allApplications,
      applicationDeliverables: deliverablesData?.deliverables ?? NO_DELIVERABLES,
      applicationSections: modulesData?.modules ?? NO_SECTIONS,
      getApplicationByProjectId: _getApplicationByProjectId,
      selectedApplication,
      setSelectedApplication: _setSelectedApplication,
      reload: _reload,
    }),
    [
      allApplications,
      deliverablesData,
      modulesData,
      _getApplicationByProjectId,
      selectedApplication,
      _setSelectedApplication,
      _reload,
    ]
  );

  return <ApplicationContext.Provider value={applicationData}>{children}</ApplicationContext.Provider>;
};

export default ApplicationProvider;
