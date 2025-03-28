import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import TitleBar from 'src/components/common/TitleBar';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useUser } from 'src/providers';
import { selectListAcceleratorReports } from 'src/redux/features/reports/reportsSelectors';
import { requestListAcceleratorReports } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import {
  AcceleratorReport,
  ReportProjectMetric,
  ReportStandardMetric,
  ReportSystemMetric,
} from 'src/types/AcceleratorReport';

import { useParticipantProjectData } from '../ParticipantProjectContext';
import ApprovedReportMessage from './ApprovedReportMessage';
import Metadata from './Metadata';
import MetricBox from './MetricBox';
import RejectedReportMessage from './RejectedReportMessage';

const ReportView = () => {
  const { activeLocale } = useLocalization();
  const pathParams = useParams<{ projectId: string; reportId: string }>();
  const projectId = String(pathParams.projectId);
  const reportId = String(pathParams.reportId);
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const reportsResults = useAppSelector(selectListAcceleratorReports(requestId));
  const [reports, setReports] = useState<AcceleratorReport[]>();
  const [selectedReport, setSelectedReport] = useState<AcceleratorReport>();
  const { isAllowed } = useUser();
  const [, setShowApproveDialog] = useState<boolean>(false);
  const [, setShowRejectDialog] = useState<boolean>(false);
  const { participantProject } = useParticipantProjectData();
  const theme = useTheme();
  const [editingId, setEditingId] = useState<string | undefined>();

  useEffect(() => {
    if (projectId) {
      const request = dispatch(requestListAcceleratorReports({ projectId, includeFuture: true, includeMetrics: true }));
      setRequestId(request.requestId);
    }
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
    if (reports) {
      const reportSelected = reports.find((report) => report.id.toString() === reportId);
      setSelectedReport(reportSelected);
    }
  }, [reportId, reports]);

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.REPORTS : '',
        to: APP_PATHS.ACCELERATOR_PROJECT_REPORTS,
      },
    ],
    [activeLocale]
  );

  const callToAction = useMemo(() => {
    return (
      isAllowed('UPDATE_SUBMISSION_STATUS') && (
        <>
          <Button
            disabled={selectedReport?.status === 'Needs Update'}
            id='rejectDeliverable'
            label={strings.REJECT_ACTION}
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

  const year = selectedReport?.startDate.split('-')[0];
  const quarterNumber = selectedReport?.startDate
    ? Math.ceil((new Date(selectedReport?.startDate).getMonth() + 1) / 3)
    : 0;
  const reportName =
    selectedReport?.frequency === 'Annual' ? `${year}` : quarterNumber ? `${year}-Q${quarterNumber}` : '';

  return (
    <Page
      title={
        <TitleBar
          title={`${strings.REPORT} (${reportName})`}
          subtitle={participantProject ? `${strings.PROJECT}: ${participantProject?.dealName}` : ''}
        />
      }
      rightComponent={rightComponent}
      crumbs={crumbs}
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
          {selectedReport && <Metadata report={selectedReport} />}
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
          {selectedReport?.systemMetrics.map((systemMetric: ReportSystemMetric, index: number) => (
            <MetricBox
              key={index}
              editingId={editingId}
              index={index}
              projectId={projectId}
              reload={() => true}
              setEditingId={setEditingId}
              metric={systemMetric}
              type={'system'}
              reportId={Number(reportId)}
            />
          ))}
          {selectedReport?.projectMetrics.map((projectMetric: ReportProjectMetric, index: number) => (
            <MetricBox
              key={index}
              editingId={editingId}
              index={index}
              projectId={projectId}
              reload={() => true}
              setEditingId={setEditingId}
              metric={projectMetric}
              type={'project'}
              reportId={Number(reportId)}
            />
          ))}
          {selectedReport?.standardMetrics.map((standardMetric: ReportStandardMetric, index: number) => (
            <MetricBox
              key={index}
              editingId={editingId}
              index={index}
              projectId={projectId}
              reload={() => true}
              setEditingId={setEditingId}
              metric={standardMetric}
              type={'standard'}
              reportId={selectedReport.id}
            />
          ))}
        </Card>
      </Box>
    </Page>
  );
};

export default ReportView;
