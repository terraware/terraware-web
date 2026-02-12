import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { DateTime } from 'luxon';

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
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useGetAcceleratorReportQuery, useSubmitAcceleratorReportMutation } from 'src/queries/generated/reports';
import strings from 'src/strings';
import { MetricType } from 'src/types/AcceleratorReport';

import SubmitReportDialog from './SubmitReportDialog';

const AcceleratorReportView = () => {
  const { activeLocale } = useLocalization();
  const { currentParticipantProject, setCurrentParticipantProject } = useParticipantData();
  const theme = useTheme();

  const { goToAcceleratorReportEdit } = useNavigateTo();

  const pathParams = useParams<{ projectId: string; reportId: string }>();
  const reportId = Number(pathParams.reportId);
  const projectId = Number(pathParams.projectId);

  const reportResponse = useGetAcceleratorReportQuery({
    projectId,
    reportId,
    includeMetrics: true,
  });

  const report = useMemo(() => reportResponse?.data?.report, [reportResponse?.data]);

  const [submit, submitResponse] = useSubmitAcceleratorReportMutation();

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  useEffect(() => {
    if (projectId !== currentParticipantProject?.id) {
      setCurrentParticipantProject(projectId);
    }
  }, [currentParticipantProject?.id, projectId, setCurrentParticipantProject]);

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
    goToAcceleratorReportEdit(reportId, projectId);
  }, [goToAcceleratorReportEdit, projectId, reportId]);

  const callToAction = useMemo(() => {
    const buttonsDisabled =
      !report?.id ||
      (report?.status !== 'Not Submitted' && report?.status !== 'Needs Update') ||
      reportResponse.isLoading ||
      submitResponse.isLoading;

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
          onClick={() => setShowSubmitDialog(true)}
          size='medium'
          sx={{ '&.button': { whiteSpace: 'nowrap', minWidth: 'auto' } }}
        />
      </>
    );
  }, [goToReportEdit, report?.id, report?.status, reportResponse.isLoading, submitResponse.isLoading]);

  const rightComponent = useMemo(
    () => (
      <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
        {callToAction}
      </Box>
    ),
    [callToAction, theme]
  );

  const submitReport = useCallback(() => {
    void submit({ reportId, projectId });
    setShowSubmitDialog(false);
  }, [projectId, reportId, submit]);

  const reportName = report?.frequency === 'Annual' ? year : report?.quarter ? `${year}-${report?.quarter}` : '';

  const yearToUse = useMemo(
    () => (year ? Number(report?.startDate.split('-')[0]) : DateTime.now().year),
    [report?.startDate, year]
  );

  return (
    <>
      {showSubmitDialog && <SubmitReportDialog onClose={() => setShowSubmitDialog(false)} onSubmit={submitReport} />}

      <Page
        crumbs={crumbs}
        rightComponent={rightComponent}
        title={
          <TitleBar
            subtitle={currentParticipantProject ? `${strings.PROJECT}: ${currentParticipantProject?.name}` : ''}
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
            <HighlightsBox report={report} projectId={projectId} />
            {['system', 'project', 'standard'].map((type) => {
              const metrics =
                type === 'system'
                  ? report?.systemMetrics
                  : type === 'project'
                    ? report?.projectMetrics
                    : report?.standardMetrics;

              return metrics?.map((metric, index) => {
                return (
                  <MetricBox
                    key={`${type}-${index}`}
                    metric={metric}
                    projectId={projectId}
                    reportId={Number(reportId)}
                    type={type as MetricType}
                    year={yearToUse}
                  />
                );
              });
            })}
            <AchievementsBox report={report} projectId={projectId} />
            <ChallengesMitigationBox report={report} projectId={projectId} />
            <FinancialSummariesBox report={report} projectId={projectId} />
            <AdditionalCommentsBox report={report} projectId={projectId} />
            <PhotosBox report={report} projectId={projectId} />
          </Card>
        </Box>
      </Page>
    </>
  );
};

export default AcceleratorReportView;
