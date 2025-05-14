import React, { useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import TfMain from 'src/components/common/TfMain';
import { useLocalization, useUserFundingEntity } from 'src/providers';
import { requestListFunderReports } from 'src/redux/features/funder/entities/fundingEntitiesAsyncThunks';
import { selectListFunderReports } from 'src/redux/features/funder/entities/fundingEntitiesSelectors';
import { requestGetFunderProject } from 'src/redux/features/funder/projects/funderProjectsAsyncThunks';
import { selectFunderProjectRequest } from 'src/redux/features/funder/projects/funderProjectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import FunderReportView from 'src/scenes/FunderReport/FunderReportView';
import strings from 'src/strings';
import { PublishedReport } from 'src/types/AcceleratorReport';
import { FunderProjectDetails } from 'src/types/FunderProject';
import useSnackbar from 'src/utils/useSnackbar';
import useStickyTabs from 'src/utils/useStickyTabs';

import ProjectProfileView from '../AcceleratorRouter/ParticipantProjects/ProjectProfileView';

export default function FunderHome() {
  const { activeLocale } = useLocalization();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { userFundingEntity } = useUserFundingEntity();
  const [selectedProjectId, setSelectedProjectId] = useState<number>();
  const [projectDetails, setProjectDetails] = useState<FunderProjectDetails>();
  const getFunderProjectResult = useAppSelector(selectFunderProjectRequest(selectedProjectId || -1));
  const reportsResponse = useAppSelector(selectListFunderReports(selectedProjectId?.toString() ?? ''));
  const [publishedReports, setPublishedReports] = useState<PublishedReport[]>();

  useEffect(() => {
    if (!getFunderProjectResult) {
      return;
    }

    if (getFunderProjectResult.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    } else if (getFunderProjectResult.status === 'success' && getFunderProjectResult.data) {
      setProjectDetails(getFunderProjectResult.data);
    }
  }, [getFunderProjectResult, snackbar]);

  useEffect(() => {
    if ((userFundingEntity?.projects?.length ?? 0) > 0) {
      setSelectedProjectId(userFundingEntity?.projects?.[0].projectId);
    }
  }, [userFundingEntity]);

  useEffect(() => {
    if (selectedProjectId && selectedProjectId !== -1) {
      void dispatch(requestGetFunderProject(selectedProjectId));
      void dispatch(requestListFunderReports(selectedProjectId));
    }
  }, [dispatch, selectedProjectId]);

  useEffect(() => {
    if (reportsResponse?.status === 'success') {
      setPublishedReports(reportsResponse.data);
    }
  }, [reportsResponse]);

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }
    return [
      {
        id: 'projectProfile',
        label: strings.PROJECT_PROFILE,
        children: (
          <ProjectProfileView funderView={true} projectDetails={projectDetails} publishedReports={publishedReports} />
        ),
      },
      {
        id: 'report',
        label: strings.REPORT,
        children: (
          <FunderReportView
            selectedProjectId={selectedProjectId}
            reports={publishedReports}
            userFundingEntity={userFundingEntity}
          />
        ),
      },
    ];
  }, [activeLocale, userFundingEntity, projectDetails, selectedProjectId, publishedReports]);

  const { activeTab, onTabChange } = useStickyTabs({
    defaultTab: 'projectProfile',
    tabs,
    viewIdentifier: 'funder-home',
    keepQuery: false,
  });

  return (
    <TfMain>
      <Box
        component='main'
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box>
          <Tabs activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
        </Box>
      </Box>
    </TfMain>
  );
}
