import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
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
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { getAcceleratorReport } from 'src/redux/features/reports/reportsSelectors';
import { requestAcceleratorReport } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorReport, MetricType } from 'src/types/AcceleratorReport';

const AcceleratorReportView = () => {
  const { activeLocale } = useLocalization();
  const { currentParticipantProject, setCurrentParticipantProject } = useParticipantData();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { goToAcceleratorReportEdit } = useNavigateTo();

  const pathParams = useParams<{ projectId: string; reportId: string }>();
  const reportId = String(pathParams.reportId);
  const projectId = String(pathParams.projectId);

  const [requestId, setRequestId] = useState<string>('');
  const [report, setReport] = useState<AcceleratorReport>();
  const [, setShowApproveDialog] = useState<boolean>(false);

  const getReportResults = useAppSelector(getAcceleratorReport(requestId));

  const reload = () => {
    if (projectId) {
      const request = dispatch(requestAcceleratorReport({ projectId, reportId, includeMetrics: true }));
      setRequestId(request.requestId);
    }
  };

  useEffect(() => {
    if (projectId !== currentParticipantProject?.id?.toString()) {
      setCurrentParticipantProject(projectId);
    }
  }, [currentParticipantProject?.id, projectId]);

  useEffect(() => {
    reload();
  }, [projectId]);

  useEffect(() => {
    if (getReportResults?.status === 'error') {
      return;
    }
    if (getReportResults?.data) {
      setReport(getReportResults.data);
    }
  }, [getReportResults]);

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

  const callToAction = useMemo(() => {
    return (
      <>
        <Button
          disabled={report?.status !== 'Not Submitted' && report?.status !== 'Needs Update'}
          icon='iconEdit'
          id='editReport'
          label={strings.EDIT}
          onClick={() => {
            goToAcceleratorReportEdit(Number(reportId), Number(projectId));
          }}
          priority='secondary'
          size='medium'
        />
        <Button
          disabled={report?.status !== 'Not Submitted' && report?.status !== 'Needs Update'}
          id='submitReport'
          label={strings.SUBMIT_FOR_APPROVAL}
          onClick={() => void setShowApproveDialog(true)}
          size='medium'
          sx={{ '&.button': { whiteSpace: 'nowrap' } }}
        />
      </>
    );
  }, [report?.status]);

  const rightComponent = useMemo(
    () => (
      <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
        {callToAction}
      </Box>
    ),
    [callToAction]
  );

  const reportName = report?.frequency === 'Annual' ? year : report?.quarter ? `${year}-${report?.quarter}` : '';

  return (
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
          <HighlightsBox report={report} projectId={projectId} reportId={reportId} reload={reload} />
          {['system', 'project', 'standard'].map((type) => {
            const metrics =
              type === 'system'
                ? report?.systemMetrics
                : type === 'project'
                  ? report?.projectMetrics
                  : report?.standardMetrics;

            return metrics?.map((metric, index) => (
              <MetricBox
                index={index}
                key={`${type}-${index}`}
                metric={metric}
                projectId={projectId}
                reload={reload}
                reportId={Number(reportId)}
                setEditingId={() => {}}
                type={type as MetricType}
              />
            ));
          })}
          <AchievementsBox report={report} projectId={projectId} reportId={reportId} reload={reload} />
          <ChallengesMitigationBox report={report} projectId={projectId} reportId={reportId} reload={reload} />
        </Card>
      </Box>
    </Page>
  );
};

export default AcceleratorReportView;
