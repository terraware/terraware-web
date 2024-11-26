import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useOrganization, useUser } from 'src/providers';
import {
  requestListApplicationDeliverables,
  requestListApplicationModules,
  requestListApplications,
} from 'src/redux/features/application/applicationAsyncThunks';
import {
  selectApplicationDeliverableList,
  selectApplicationList,
  selectApplicationModuleList,
} from 'src/redux/features/application/applicationSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Application, ApplicationDeliverable, ApplicationModule } from 'src/types/Application';
import { isAllowed } from 'src/utils/acl';

import { ApplicationContext, ApplicationData } from './Context';

export type Props = {
  children?: ReactNode;
};

const ApplicationProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();

  const [allApplications, setAllApplications] = useState<Application[]>();
  const [applicationSections, setApplicationSections] = useState<ApplicationModule[]>([]);
  const [applicationDeliverables, setApplicationDeliverables] = useState<ApplicationDeliverable[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application>();

  const { user } = useUser();
  const isAllowedAllApplications = useMemo(
    () => (user ? isAllowed(user, 'READ_ALL_APPLICATIONS') : false),
    [user, isAllowed]
  );

  const { isAcceleratorRoute } = useAcceleratorConsole();

  const [listApplicationsRequest, setListApplicationRequest] = useState<string>('');
  const listApplicationsResult = useAppSelector(selectApplicationList(listApplicationsRequest));

  const [listApplicationDeliverablesRequest, setListApplicationDeliverablesRequest] = useState<string>('');
  const listApplicationDeliverablesResult = useAppSelector(
    selectApplicationDeliverableList(listApplicationDeliverablesRequest)
  );

  const [listApplicationModulesRequest, setListApplicationModulesRequest] = useState<string>('');
  const listApplicationModulesResult = useAppSelector(selectApplicationModuleList(listApplicationModulesRequest));

  const [reloadCallback, setReloadCallback] = useState<() => void>();

  const _setSelectedApplication = useCallback(
    (applicationId: string | number) => {
      if (allApplications && allApplications.length > 0) {
        const nextApplication = allApplications.find((application) => application.id === Number(applicationId));
        setSelectedApplication(nextApplication);
      }
    },
    [allApplications]
  );

  const loadApplications = useCallback(() => {
    if (isAcceleratorRoute && isAllowedAllApplications) {
      const listAll = dispatch(requestListApplications({ listAll: true }));
      setListApplicationRequest(listAll.requestId);
    } else if (selectedOrganization && selectedOrganization.id !== -1) {
      const listOrg = dispatch(requestListApplications({ organizationId: selectedOrganization.id }));
      setListApplicationRequest(listOrg.requestId);
    }
  }, [dispatch, isAcceleratorRoute, isAllowedAllApplications, selectedOrganization, setListApplicationRequest]);

  const _reload = useCallback(
    (onReload?: () => void) => {
      setReloadCallback(onReload);
      loadApplications();
    },
    [dispatch, loadApplications, setReloadCallback]
  );

  const _getApplicationByProjectId = useCallback(
    (projectId: number) => {
      if (!allApplications) {
        return undefined;
      }
      return allApplications.find((application) => application.projectId === projectId);
    },
    [allApplications]
  );

  const [applicationData, setApplicationData] = useState<ApplicationData>({
    allApplications,
    applicationDeliverables,
    applicationSections,
    getApplicationByProjectId: _getApplicationByProjectId,
    selectedApplication,
    setSelectedApplication: _setSelectedApplication,
    reload: _reload,
  });

  useEffect(() => {
    if (selectedOrganization || isAcceleratorRoute) {
      loadApplications();
    }
  }, [dispatch, selectedOrganization, isAcceleratorRoute, loadApplications]);

  useEffect(() => {
    if (listApplicationsResult && listApplicationsResult.status === 'success' && listApplicationsResult.data) {
      setAllApplications(listApplicationsResult.data);
      reloadCallback?.();
      setReloadCallback(undefined);
    }
  }, [listApplicationsResult, setAllApplications, reloadCallback]);

  useEffect(() => {
    if (selectedApplication) {
      const listModulesDispatched = dispatch(requestListApplicationModules({ applicationId: selectedApplication.id }));
      setListApplicationModulesRequest(listModulesDispatched.requestId);

      const listDeliverablesDispatched = dispatch(
        requestListApplicationDeliverables({ applicationId: selectedApplication.id })
      );
      setListApplicationDeliverablesRequest(listDeliverablesDispatched.requestId);
    }
  }, [dispatch, selectedApplication, setListApplicationModulesRequest, setListApplicationDeliverablesRequest]);

  useEffect(() => {
    if (listApplicationDeliverablesResult?.status === 'success' && listApplicationDeliverablesResult.data) {
      setApplicationDeliverables(listApplicationDeliverablesResult.data);
    }
  }, [listApplicationDeliverablesResult, setApplicationDeliverables]);

  useEffect(() => {
    if (listApplicationModulesResult?.status === 'success' && listApplicationModulesResult.data) {
      setApplicationSections(listApplicationModulesResult.data);
    }
  }, [listApplicationModulesResult, setApplicationSections]);

  useEffect(() => {
    setApplicationData({
      allApplications,
      applicationDeliverables,
      applicationSections,
      getApplicationByProjectId: _getApplicationByProjectId,
      selectedApplication,
      setSelectedApplication: _setSelectedApplication,
      reload: _reload,
    });
  }, [
    allApplications,
    applicationDeliverables,
    applicationSections,
    _getApplicationByProjectId,
    selectedApplication,
    _setSelectedApplication,
    _reload,
  ]);

  return <ApplicationContext.Provider value={applicationData}>{children}</ApplicationContext.Provider>;
};

export default ApplicationProvider;
