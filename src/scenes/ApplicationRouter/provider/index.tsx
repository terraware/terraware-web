import React, { ReactNode, useCallback, useEffect, useState } from 'react';

import { useLocalization, useOrganization } from 'src/providers';
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
import ApplicationService from 'src/services/ApplicationService';
import strings from 'src/strings';
import { Application, ApplicationDeliverable, ApplicationModule } from 'src/types/Application';
import useSnackbar from 'src/utils/useSnackbar';

import { ApplicationContext, ApplicationData } from './Context';

export type Props = {
  children?: ReactNode;
};

const ApplicationProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { toastError } = useSnackbar();

  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [applicationSections, setApplicationSections] = useState<ApplicationModule[]>([]);
  const [applicationDeliverables, setApplicationDeliverables] = useState<ApplicationDeliverable[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application>();

  const [listApplicationsRequest, setListApplicationRequest] = useState<string>('');
  const listApplicationsResult = useAppSelector(selectApplicationList(listApplicationsRequest));

  const [listApplicationDeliverablesRequest, setListApplicationDeliverablesRequest] = useState<string>('');
  const listApplicationDeliverablesResult = useAppSelector(
    selectApplicationDeliverableList(listApplicationDeliverablesRequest)
  );

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

  const _reload = useCallback(async () => {
    if (selectedApplication) {
      const result = await ApplicationService.getApplication(selectedApplication.id);
      if (result.requestSucceeded && result.data) {
        setSelectedApplication(result.data.application);
      } else {
        toastError(activeLocale ? strings.GENERIC_ERROR : 'Error reloading applicaiton');
      }
    }
    if (selectedOrganization) {
      const dispatched = dispatch(requestListApplications({ organizationId: selectedOrganization.id }));
      setListApplicationRequest(dispatched.requestId);
    }
  }, [dispatch, selectedOrganization, setListApplicationRequest, setSelectedApplication, toastError]);

  const create = useCallback(
    async (projectId: number) => {
      const result = await ApplicationService.createApplication(projectId);
      if (result.requestSucceeded && result.data) {
        return result.data.id;
      } else {
        toastError(activeLocale ? strings.GENERIC_ERROR : 'Error creating applicaiton');
      }
    },
    [activeLocale, toastError]
  );

  const restart = useCallback(async () => {
    if (selectedApplication) {
      const result = await ApplicationService.restartApplication(selectedApplication.id);
      if (!result.requestSucceeded) {
        toastError(activeLocale ? strings.GENERIC_ERROR : 'Error restarting applicaiton');
      }
    }
  }, [activeLocale, selectedApplication, toastError]);

  const submit = useCallback(async () => {
    if (selectedApplication) {
      const result = await ApplicationService.submitApplication(selectedApplication.id);
      if (result.requestSucceeded && result.data) {
        return result.data?.problems;
      } else {
        toastError(activeLocale ? strings.GENERIC_ERROR : 'Error restarting applicaiton');
      }
    }
  }, [activeLocale, selectedApplication, toastError]);

  const [applicationData, setApplicationData] = useState<ApplicationData>({
    allApplications,
    applicationDeliverables,
    applicationSections,
    selectedApplication,
    setSelectedApplication: _setSelectedApplication,
    create,
    reload: _reload,
    restart,
    submit,
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
      selectedApplication,
      setSelectedApplication: _setSelectedApplication,
      create,
      reload: _reload,
      restart,
      submit,
    });
  }, [
    allApplications,
    applicationDeliverables,
    applicationSections,
    selectedApplication,
    _setSelectedApplication,
    create,
    _reload,
    restart,
    submit,
  ]);

  return <ApplicationContext.Provider value={applicationData}>{children}</ApplicationContext.Provider>;
};

export default ApplicationProvider;
