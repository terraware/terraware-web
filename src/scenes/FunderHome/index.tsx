import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { SelectT, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import TfMain from 'src/components/common/TfMain';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
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
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import useStickyTabs from 'src/utils/useStickyTabs';

import ProjectProfileView from '../AcceleratorRouter/ParticipantProjects/ProjectProfileView';

const DEAL_NAME_COUNTRY_CODE_REGEX = /^[A-Z]{3}_/;

export default function FunderHome() {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { userFundingEntity } = useUserFundingEntity();
  const query = useQuery();
  const location = useStateLocation();
  const navigate = useSyncNavigate();
  const { isMobile } = useDeviceInfo();
  const [selectedProjectId, setSelectedProjectId] = useState<number>();
  const [projectDetails, setProjectDetails] = useState<FunderProjectDetails>();
  const getFunderProjectResult = useAppSelector(selectFunderProjectRequest(selectedProjectId || -1));
  const reportsResponse = useAppSelector(selectListFunderReports(selectedProjectId?.toString() ?? ''));
  const [publishedReports, setPublishedReports] = useState<PublishedReport[]>();
  const [selectedReport, setSelectedReport] = useState<PublishedReport>();

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

  useEffect(() => {
    if (!selectedReport && publishedReports?.length) {
      if (query.get('reportId')) {
        const found = publishedReports?.find((r) => r.reportId.toString() === query.get('reportId'));
        setSelectedReport(found || publishedReports[0]);
        query.delete('reportId');
        navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
      } else {
        setSelectedReport(publishedReports[0]);
      }
    }
  }, [location, navigate, query, publishedReports, selectedReport]);

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
        children: <FunderReportView selectedProjectId={selectedProjectId} selectedReport={selectedReport} />,
      },
    ];
  }, [activeLocale, projectDetails, selectedProjectId, publishedReports, selectedReport]);

  const { activeTab, onTabChange } = useStickyTabs({
    defaultTab: 'projectProfile',
    tabs,
    viewIdentifier: 'funder-home',
  });

  const strippedDealName = useMemo(() => {
    if (projectDetails?.dealName?.match(DEAL_NAME_COUNTRY_CODE_REGEX)) {
      return projectDetails?.dealName?.replace(DEAL_NAME_COUNTRY_CODE_REGEX, '');
    } else {
      return projectDetails?.dealName;
    }
  }, [projectDetails?.dealName]);

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
          <Box
            margin={theme.spacing(3)}
            display={isMobile ? 'block' : 'flex'}
            alignItems='center'
            justifyContent='space-between'
          >
            <Typography fontWeight={600} lineHeight={'40px'} fontSize={'24px'}>
              {strippedDealName}
            </Typography>
            {activeTab === 'report' && (publishedReports?.length ?? 0) > 0 && (
              <SelectT<PublishedReport>
                id='report'
                label={''}
                placeholder={strings.SELECT}
                options={publishedReports}
                onChange={(_report: PublishedReport) => {
                  setSelectedReport(_report);
                }}
                selectedValue={selectedReport}
                isEqual={(a: PublishedReport, b: PublishedReport) => a.reportId === b.reportId}
                renderOption={(_report: PublishedReport) => `${_report?.startDate?.split('-')[0]} ${_report?.quarter}`}
                displayLabel={(_report: PublishedReport) => `${_report?.startDate?.split('-')[0]} ${_report?.quarter}`}
                toT={(name: string) => ({ name }) as unknown as PublishedReport}
                selectStyles={{ inputContainer: { 'margin-top': isMobile ? theme.spacing(2) : 0 } }}
              />
            )}
          </Box>
          <Tabs activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
        </Box>
      </Box>
    </TfMain>
  );
}
