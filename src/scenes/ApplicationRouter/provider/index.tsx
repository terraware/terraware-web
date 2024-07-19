import React, { ReactNode, useCallback, useEffect, useState } from 'react';

import { useOrganization } from 'src/providers';
import {
  requestListApplicationModules,
  requestListApplications,
} from 'src/redux/features/application/applicationAsyncThunks';
import {
  selectApplicationList,
  selectApplicationModuleList,
} from 'src/redux/features/application/applicationSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Application, ApplicationModuleWithDeliverables } from 'src/types/Application';

import { ApplicationContext, ApplicationData } from './Context';

export type Props = {
  children?: ReactNode;
};

const ApplicationProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();

  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [applicationSections, setApplicationSections] = useState<ApplicationModuleWithDeliverables[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application>();

  const [listApplicationsRequest, setListApplicationRequest] = useState<string>('');
  const listApplicationsResult = useAppSelector(selectApplicationList(listApplicationsRequest));

  const [listApplicationModulesRequest, setListApplicationModulesRequest] = useState<string>('');
  const listApplicationModulesResult = useAppSelector(selectApplicationModuleList(listApplicationModulesRequest));

  const _setSelectedApplication = useCallback(
    (applicationId: string | number) => {
      if (allApplications.length > 0) {
        const nextApplication = allApplications.find((application) => application.id === Number(applicationId));
        setSelectedApplication(nextApplication);
      }
    },
    [allApplications]
  );

  const _reload = useCallback(() => {
    if (selectedOrganization) {
      const dispatched = dispatch(requestListApplications({ organizationId: selectedOrganization.id }));
      setListApplicationRequest(dispatched.requestId);
    }
  }, [dispatch, selectedOrganization, setListApplicationRequest]);

  const [applicationData, setApplicationData] = useState<ApplicationData>({
    allApplications,
    applicationSections,
    selectedApplication,
    setSelectedApplication: _setSelectedApplication,
    reload: _reload,
  });

  useEffect(() => {
    if (selectedOrganization) {
      const dispatched = dispatch(requestListApplications({ organizationId: selectedOrganization.id }));
      setListApplicationRequest(dispatched.requestId);
    }
  }, [dispatch, selectedOrganization, setListApplicationRequest]);

  useEffect(() => {
    if (listApplicationsResult && listApplicationsResult.status === 'success' && listApplicationsResult.data) {
      setAllApplications(listApplicationsResult.data);
    }
  }, [listApplicationsResult, setAllApplications]);

  useEffect(() => {
    if (selectedApplication) {
      const dispatched = dispatch(requestListApplicationModules({ applicationId: selectedApplication.id }));
      setListApplicationModulesRequest(dispatched.requestId);
    }
  }, [dispatch, selectedApplication, setListApplicationModulesRequest]);

  useEffect(() => {
    if (
      listApplicationModulesResult &&
      listApplicationModulesResult.status === 'success' &&
      listApplicationModulesResult.data
    ) {
      setApplicationSections(listApplicationModulesResult.data);
    }
  }, [listApplicationModulesResult, setApplicationSections]);

  useEffect(() => {
    setApplicationData({
      allApplications,
      applicationSections,
      selectedApplication,
      setSelectedApplication: _setSelectedApplication,
      reload: _reload,
    });
  }, [allApplications, applicationSections, selectedApplication, _setSelectedApplication, _reload]);

  return <ApplicationContext.Provider value={applicationData}>{children}</ApplicationContext.Provider>;
};

export default ApplicationProvider;
