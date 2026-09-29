import React, { ReactNode, useCallback, useMemo, useState } from 'react';

import { skipToken } from '@reduxjs/toolkit/query';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useOrganization, useUser } from 'src/providers';
import {
  useGetApplicationDeliverablesQuery,
  useGetApplicationModulesQuery,
  useListApplicationsQuery,
} from 'src/queries/generated/applications';
import { ApplicationDeliverable, ApplicationModule } from 'src/types/Application';
import { isAllowed } from 'src/utils/acl';

import { ApplicationContext, ApplicationData } from './Context';

type Props = {
  children?: ReactNode;
};

const NO_SECTIONS: ApplicationModule[] = [];
const NO_DELIVERABLES: ApplicationDeliverable[] = [];

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
    (onReload?: () => void) => {
      if (listArg === skipToken) {
        onReload?.();
        return;
      }
      const refetches: Promise<unknown>[] = [refetchApplications()];
      if (selectedApplication) {
        refetches.push(refetchModules(), refetchDeliverables());
      }
      void Promise.all(refetches).then(() => onReload?.());
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
