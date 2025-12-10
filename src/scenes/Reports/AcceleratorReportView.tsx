import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import AdditionalCommentsBox from 'src/components/AcceleratorReports/AdditionalCommentsBox';
import ApprovedReportMessage from 'src/components/AcceleratorReports/ApprovedReportMessage';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import FinancialSummariesBox from 'src/components/AcceleratorReports/FinancialSummaryBox';
import HighlightsBox from 'src/components/AcceleratorReports/HighlightsBox';
import MetricBox from 'src/components/AcceleratorReports/MetricBox';
import PhotosBox from 'src/components/AcceleratorReports/PhotosBox';
import RejectedReportMessage from 'src/components/AcceleratorReports/RejectedReportMessage';
import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import TitleBar from 'src/components/common/TitleBar';
import { APP_PATHS } from 'src/constants';
import useBoolean from 'src/hooks/useBoolean';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { selectAcceleratorReport, selectSubmitAcceleratorReport } from 'src/redux/features/reports/reportsSelectors';
import { requestAcceleratorReport, requestSubmitAcceleratorReport } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorReport, MetricType } from 'src/types/AcceleratorReport';
import useSnackbar from 'src/utils/useSnackbar';

import SubmitReportDialog from './SubmitReportDialog';

const AcceleratorReportView = () => {
  const { activeLocale } = useLocalization();
  const { currentParticipantProject, setCurrentParticipantProject } = useParticipantData();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { goToAcceleratorReportEdit } = useNavigateTo();

  const pathParams = useParams<{ projectId: string; reportId: string }>();
  const reportId = String(pathParams.reportId);
  const projectId = String(pathParams.projectId);

  const [requestId, setRequestId] = useState<string>('');
  const [submitReportRequestId, setSubmitReportRequestId] = useState<string>('');
  const [report, setReport] = useState<AcceleratorReport>();
  const [showApproveDialog, , openApprovalDialog, closeApproveDialog] = useBoolean(false);

  const getReportResults = useAppSelector(selectAcceleratorReport(requestId));
  const submitReportResults = useAppSelector(selectSubmitAcceleratorReport(submitReportRequestId));

  const reload = useCallback(() => {
    if (projectId) {
      const request = dispatch(requestAcceleratorReport({ projectId, reportId, includeMetrics: true }));
      setRequestId(request.requestId);
    }
  }, [projectId, dispatch, reportId]);

  useEffect(() => {
    if (projectId !== currentParticipantProject?.id?.toString()) {
      setCurrentParticipantProject(projectId);
    }
  }, [currentParticipantProject?.id, projectId, setCurrentParticipantProject]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (getReportResults?.status === 'error') {
      return;
    }
    if (getReportResults?.data) {
      setReport(getReportResults.data);
    }
  }, [getReportResults]);

  useEffect(() => {
    if (submitReportResults?.status === 'error') {
      snackbar.toastError();
    } else if (submitReportResults?.status === 'success') {
      reload();
      snackbar.toastSuccess(strings.REPORT_SUBMITTED_FOR_APPROVAL);
    }
  }, [reload, snackbar, submitReportResults?.status]);

  const year = useMemo(() => {
    return report?.startDate.split('-')[0];
  }, [report]);

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.REPORTS : '',
        to: year ? `${APP_PATHS.REPORTS}?year=${year}` : APP_PATHS.REPORTS,
      },
    ],
    [activeLocale, year]
  );

  const goToReportEdit = useCallback(() => {
    goToAcceleratorReportEdit(Number(reportId), Number(projectId));
  }, [goToAcceleratorReportEdit, projectId, reportId]);

  const callToAction = useMemo(() => {
    const buttonsDisabled =
      !report?.id ||
      (report?.status !== 'Not Submitted' && report?.status !== 'Needs Update') ||
      getReportResults?.status === 'pending' ||
      submitReportResults?.status === 'pending';

    return (
      <>
        <Button
          disabled={buttonsDisabled}
          icon='iconEdit'
          id='editReport'
          label={strings.EDIT}
          onClick={goToReportEdit}
          priority='secondary'
          size='medium'
        />
        <Button
          disabled={buttonsDisabled}
          id='submitReport'
          label={strings.SUBMIT_FOR_APPROVAL}
          onClick={openApprovalDialog}
          size='medium'
          sx={{ '&.button': { whiteSpace: 'nowrap' } }}
        />
      </>
    );
  }, [
    getReportResults?.status,
    goToReportEdit,
    openApprovalDialog,
    report?.id,
    report?.status,
    submitReportResults?.status,
  ]);

  const rightComponent = useMemo(
    () => (
      <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
        {callToAction}
      </Box>
    ),
    [callToAction, theme]
  );

  const submitReport = useCallback(() => {
    const request = dispatch(requestSubmitAcceleratorReport({ projectId, reportId }));
    setSubmitReportRequestId(request.requestId);
    closeApproveDialog();
  }, [closeApproveDialog, dispatch, projectId, reportId]);

  const reportName = report?.frequency === 'Annual' ? year : report?.quarter ? `${year}-${report?.quarter}` : '';

  return (
    <>
      {showApproveDialog && <SubmitReportDialog onClose={closeApproveDialog} onSubmit={submitReport} />}

      <Page
        crumbs={crumbs}
        rightComponent={rightComponent}
        title={
          <TitleBar
            subtitle={
              currentParticipantProject && getReportResults
                ? `${strings.PROJECT}: ${currentParticipantProject?.name}`
                : ''
            }
            title={`${strings.REPORT} (${reportName})`}
          />
        }
      >
        <Box display='flex' flexDirection='column' flexGrow={1} overflow={'auto'}>
          {report && <ApprovedReportMessage report={report} />}
          {report && <RejectedReportMessage report={report} />}
          <Card
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
            }}
          >
            {report?.startDate && report?.endDate && (
              <Box
                borderBottom={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
                padding={theme.spacing(3, 0)}
                marginBottom={3}
              >
                <div style={{ float: 'right', marginBottom: '0px', marginLeft: '16px' }}>
                  <AcceleratorReportStatusBadge status={report.status} />
                </div>

                <Typography fontSize={14} fontStyle={'italic'}>
                  {strings.formatString(strings.REPORT_PERIOD, report?.startDate, report?.endDate)}
                </Typography>
              </Box>
            )}
            <HighlightsBox report={report} projectId={projectId} reload={reload} />
            {['system', 'project', 'standard'].map((type) => {
              const metrics =
                type === 'system'
                  ? report?.systemMetrics
                  : type === 'project'
                    ? report?.projectMetrics
                    : report?.standardMetrics;

              return metrics?.map((metric, index) => (
                <MetricBox
                  key={`${type}-${index}`}
                  metric={metric}
                  projectId={projectId}
                  reload={reload}
                  reportId={Number(reportId)}
                  type={type as MetricType}
                />
              ));
            })}
            <AchievementsBox report={report} projectId={projectId} reload={reload} />
            <ChallengesMitigationBox report={report} projectId={projectId} reload={reload} />
            <FinancialSummariesBox report={report} projectId={projectId} reload={reload} />
            <AdditionalCommentsBox report={report} projectId={projectId} reload={reload} />
            <PhotosBox report={report} projectId={projectId} reload={reload} />
          </Card>
        </Box>
      </Page>
    </>
  );
};

export default AcceleratorReportView;
