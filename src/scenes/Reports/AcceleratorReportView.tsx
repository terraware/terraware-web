import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import TitleBar from 'src/components/common/TitleBar';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
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

import ApprovedReportMessage from '../AcceleratorRouter/ParticipantProjects/Reports/ApprovedReportMessage';
import MetricBox from '../AcceleratorRouter/ParticipantProjects/Reports/MetricBox';
import RejectedReportMessage from '../AcceleratorRouter/ParticipantProjects/Reports/RejectedReportMessage';

const AcceleratorReportView = () => {
  const { activeLocale } = useLocalization();
  const { currentParticipantProject, setCurrentParticipantProject } = useParticipantData();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const pathParams = useParams<{ projectId: string; reportId: string }>();
  const reportId = String(pathParams.reportId);
  const projectId = String(pathParams.projectId);

  const [requestId, setRequestId] = useState<string>('');
  const [reports, setReports] = useState<AcceleratorReport[]>();
  const [selectedReport, setSelectedReport] = useState<AcceleratorReport>();
  const [, setShowApproveDialog] = useState<boolean>(false);

  const reportsResults = useAppSelector(selectListAcceleratorReports(requestId));

  const reload = () => {
    if (projectId) {
      const request = dispatch(requestListAcceleratorReports({ projectId, includeFuture: true, includeMetrics: true }));
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
        to: APP_PATHS.REPORTS,
      },
    ],
    [activeLocale]
  );

  const callToAction = useMemo(() => {
    return (
      <>
        <Button
          icon='iconEdit'
          id='editDeliverable'
          label={strings.EDIT}
          onClick={() => {
            // TODO: edit page
          }}
          priority='secondary'
          size='medium'
        />
        <Button
          disabled={selectedReport?.status === 'Approved'}
          id='submitDeliverable'
          label={strings.SUBMIT_FOR_APPROVAL}
          onClick={() => void setShowApproveDialog(true)}
          size='medium'
          sx={{ '&.button': { whiteSpace: 'nowrap' } }}
        />
      </>
    );
  }, [selectedReport?.status]);

  const rightComponent = useMemo(
    () => (
      <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
        {callToAction}
      </Box>
    ),
    [callToAction]
  );

  const year = selectedReport?.startDate.split('-')[0];
  const reportName =
    selectedReport?.frequency === 'Annual' ? year : selectedReport?.quarter ? `${year}-${selectedReport?.quarter}` : '';

  return (
    <Page
      crumbs={crumbs}
      rightComponent={rightComponent}
      title={
        <TitleBar
          subtitle={
            currentParticipantProject && reportsResults ? `${strings.PROJECT}: ${currentParticipantProject?.name}` : ''
          }
          title={`${strings.REPORT} (${reportName})`}
        />
      }
    >
      <Box display='flex' flexDirection='column' flexGrow={1} overflow={'auto'}>
        {selectedReport && <ApprovedReportMessage report={selectedReport} />}
        {selectedReport && <RejectedReportMessage report={selectedReport} />}
        <Card
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          }}
        >
          {selectedReport?.startDate && selectedReport?.endDate && (
            <Box
              borderBottom={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
              padding={theme.spacing(3, 0)}
              marginBottom={3}
            >
              <div style={{ float: 'right', marginBottom: '0px', marginLeft: '16px' }}>
                <AcceleratorReportStatusBadge status={selectedReport.status} />
              </div>

              <Typography fontSize={14} fontStyle={'italic'}>
                {strings.formatString(strings.REPORT_PERIOD, selectedReport?.startDate, selectedReport?.endDate)}
              </Typography>
            </Box>
          )}
          {selectedReport?.systemMetrics.map((systemMetric: ReportSystemMetric, index: number) => (
            <MetricBox
              key={index}
              index={index}
              projectId={projectId}
              reload={() => true}
              setEditingId={() => {}}
              showEditOnHover={false}
              metric={systemMetric}
              type={'system'}
              reportId={Number(reportId)}
            />
          ))}
          {selectedReport?.projectMetrics.map((projectMetric: ReportProjectMetric, index: number) => (
            <MetricBox
              key={index}
              index={index}
              projectId={projectId}
              reload={() => true}
              setEditingId={() => {}}
              showEditOnHover={false}
              metric={projectMetric}
              type={'project'}
              reportId={Number(reportId)}
            />
          ))}
          {selectedReport?.standardMetrics.map((standardMetric: ReportStandardMetric, index: number) => (
            <MetricBox
              key={index}
              index={index}
              projectId={projectId}
              reload={() => true}
              setEditingId={() => {}}
              showEditOnHover={false}
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

export default AcceleratorReportView;
