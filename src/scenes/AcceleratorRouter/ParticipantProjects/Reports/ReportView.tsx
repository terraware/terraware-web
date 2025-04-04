import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import ApprovedReportMessage from 'src/components/AcceleratorReports/ApprovedReportMessage';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import HighlightsBox from 'src/components/AcceleratorReports/HighlightsBox';
import MetricBox from 'src/components/AcceleratorReports/MetricBox';
import RejectedReportMessage from 'src/components/AcceleratorReports/RejectedReportMessage';
import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import TitleBar from 'src/components/common/TitleBar';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization, useUser } from 'src/providers';
import {
  selectListAcceleratorReports,
  selectReviewAcceleratorReport,
} from 'src/redux/features/reports/reportsSelectors';
import {
  requestListAcceleratorReports,
  requestReviewAcceleratorReport,
} from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorReport, MetricType } from 'src/types/AcceleratorReport';

import { useParticipantProjectData } from '../ParticipantProjectContext';
import ApproveReportDialog from './ApproveReportDialog';
import Metadata from './Metadata';
import RejectDialog from './RejectDialog';

const ReportView = () => {
  const { activeLocale } = useLocalization();
  const pathParams = useParams<{ projectId: string; reportId: string }>();
  const projectId = String(pathParams.projectId);
  const reportId = String(pathParams.reportId);
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const reportsResults = useAppSelector(selectListAcceleratorReports(requestId));
  const [reports, setReports] = useState<AcceleratorReport[]>();
  const [selectedReport, setSelectedReport] = useState<AcceleratorReport>();
  const { isAllowed } = useUser();
  const [showApproveDialog, setShowApproveDialog] = useState<boolean>(false);
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  const { crumbs: participantProjectCrumbs, participantProject, project } = useParticipantProjectData();
  const theme = useTheme();
  const [editingId, setEditingId] = useState<string | undefined>();
  const [approveRequestId, setApproveRequestId] = useState('');
  const [rejectRequestId, setRejectRequestId] = useState('');
  const approveReportResponse = useAppSelector(selectReviewAcceleratorReport(approveRequestId));
  const rejectReportResponse = useAppSelector(selectReviewAcceleratorReport(rejectRequestId));

  const approveReport = () => {
    const request = dispatch(
      requestReviewAcceleratorReport({
        projectId: Number(projectId),
        reportId: Number(reportId),
        review: {
          status: 'Approved',
          achievements: [],
          challenges: [],
        },
      })
    );
    setApproveRequestId(request.requestId);
  };

  const rejectReport = (feedback?: string) => {
    const request = dispatch(
      requestReviewAcceleratorReport({
        projectId: Number(projectId),
        reportId: Number(reportId),
        review: {
          status: 'Needs Update',
          feedback: feedback,
          achievements: [],
          challenges: [],
        },
      })
    );
    setRejectRequestId(request.requestId);
  };

  const reload = () => {
    if (projectId) {
      const request = dispatch(requestListAcceleratorReports({ projectId, includeFuture: true, includeMetrics: true }));
      setRequestId(request.requestId);
    }
  };

  useEffect(() => {
    reload();
  }, [projectId]);

  useEffect(() => {
    if (reportsResults?.status === 'error') {
      return;
    }
    if (reportsResults?.data) {
      setReports(reportsResults.data);
    }
  }, [reportsResults]);

  useEffect(() => {
    if (approveReportResponse?.status === 'error') {
      return;
    }
    if (approveReportResponse?.status === 'success') {
      reload();
    }
  }, [approveReportResponse]);

  useEffect(() => {
    if (rejectReportResponse?.status === 'error') {
      return;
    }
    if (rejectReportResponse?.status === 'success') {
      reload();
    }
  }, [rejectReportResponse]);

  useEffect(() => {
    if (reports) {
      const reportSelected = reports.find((report) => report.id.toString() === reportId);
      setSelectedReport(reportSelected);
    }
  }, [reportId, reports]);

  const year = useMemo(() => {
    return selectedReport?.startDate.split('-')[0];
  }, [selectedReport]);

  const crumbs: Crumb[] = useMemo(() => {
    let crumbsList = [
      {
        name: activeLocale ? strings.REPORTS : '',
        to: year
          ? `${APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', projectId)}?year=${year}`
          : APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', projectId),
      },
    ];
    if (isAcceleratorRoute) {
      crumbsList = [
        ...participantProjectCrumbs,
        {
          name: participantProject?.dealName || project?.name || '',
          to: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', participantProject?.projectId.toString() || ''),
        },
      ].concat(crumbsList);
    }

    return crumbsList;
  }, [activeLocale, participantProject, project, year]);

  const callToAction = useMemo(() => {
    return (
      isAllowed('UPDATE_SUBMISSION_STATUS') && (
        <>
          <Button
            disabled={selectedReport?.status === 'Needs Update'}
            id='rejectDeliverable'
            label={strings.REQUEST_UPDATE_ACTION}
            priority='secondary'
            onClick={() => void setShowRejectDialog(true)}
            size='medium'
            type='destructive'
          />
          <Button
            disabled={selectedReport?.status === 'Approved'}
            id='approveDeliverable'
            label={strings.APPROVE}
            onClick={() => void setShowApproveDialog(true)}
            size='medium'
          />
        </>
      )
    );
  }, [selectedReport?.status, isAllowed]);

  const rightComponent = useMemo(
    () => (
      <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
        {callToAction}
      </Box>
    ),
    [callToAction]
  );

  const reportName = selectedReport
    ? selectedReport.frequency === 'Annual'
      ? `${year}`
      : `${year}-${selectedReport.quarter}`
    : '';

  return (
    <>
      {showApproveDialog && (
        <ApproveReportDialog onClose={() => setShowApproveDialog(false)} onSubmit={approveReport} />
      )}
      {showRejectDialog && <RejectDialog onClose={() => setShowRejectDialog(false)} onSubmit={rejectReport} />}

      <Page
        title={
          <TitleBar
            title={`${strings.REPORT} (${reportName})`}
            subtitle={participantProject ? `${strings.PROJECT}: ${participantProject?.dealName}` : ''}
          />
        }
        rightComponent={selectedReport?.status !== 'Not Submitted' ? rightComponent : undefined}
        crumbs={crumbs}
        hierarchicalCrumbs={false}
      >
        <Box display='flex' flexDirection='column' flexGrow={1} overflow={'auto'}>
          {selectedReport && <ApprovedReportMessage report={selectedReport} />}
          {selectedReport && (
            <RejectedReportMessage report={selectedReport} showRejectDialog={() => setShowRejectDialog(true)} />
          )}
          <Card
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
            }}
          >
            {selectedReport && <Metadata report={selectedReport} projectId={projectId} reload={reload} />}
            {selectedReport?.startDate && selectedReport?.endDate && (
              <Box
                borderBottom={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
                padding={theme.spacing(3, 0)}
                marginBottom={3}
              >
                <Typography fontSize={14} fontStyle={'italic'}>
                  {strings.formatString(strings.REPORT_PERIOD, selectedReport?.startDate, selectedReport?.endDate)}
                </Typography>
              </Box>
            )}
            <HighlightsBox report={selectedReport} projectId={projectId} reportId={reportId} reload={reload} />
            {['system', 'project', 'standard'].map((type) => {
              const metrics =
                type === 'system'
                  ? selectedReport?.systemMetrics
                  : type === 'project'
                    ? selectedReport?.projectMetrics
                    : selectedReport?.standardMetrics;

              return metrics?.map((metric, index) => (
                <MetricBox
                  editingId={editingId}
                  index={index}
                  isConsoleView
                  key={`${type}-${index}`}
                  metric={metric}
                  projectId={projectId}
                  reload={reload}
                  reportId={Number(reportId)}
                  setEditingId={setEditingId}
                  type={type as MetricType}
                />
              ));
            })}
            <AchievementsBox report={selectedReport} projectId={projectId} reportId={reportId} reload={reload} />
            <ChallengesMitigationBox challenges={selectedReport?.challenges} />
          </Card>
        </Box>
      </Page>
    </>
  );
};

export default ReportView;
