import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Typography, useTheme } from '@mui/material';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import MetricBox, { getMetricId } from 'src/components/AcceleratorReports/MetricBox';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import TitleBar from 'src/components/common/TitleBar';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { selectListAcceleratorReports } from 'src/redux/features/reports/reportsSelectors';
import { requestListAcceleratorReports } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorReport, MetricType } from 'src/types/AcceleratorReport';

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

  const year = useMemo(() => {
    return selectedReport?.startDate.split('-')[0];
  }, [selectedReport]);

  const reportName =
    selectedReport?.frequency === 'Annual' ? year : selectedReport?.quarter ? `${year}-${selectedReport?.quarter}` : '';

  return (
    <Page
      title={
        <TitleBar
          subtitle={
            currentParticipantProject && reportsResults && activeLocale
              ? `${strings.PROJECT}: ${currentParticipantProject?.name}`
              : ''
          }
          title={activeLocale ? `${strings.REPORT} (${reportName})` : ''}
        />
      }
    >
      <Box display='flex' flexDirection='column' flexGrow={1} overflow={'auto'}>
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
          {['system', 'project', 'standard'].map((type) => {
            const metrics =
              type === 'system'
                ? selectedReport?.systemMetrics
                : type === 'project'
                  ? selectedReport?.projectMetrics
                  : selectedReport?.standardMetrics;

            return metrics?.map((metric, index) => (
              <MetricBox
                editingId={getMetricId(metric, type as MetricType)}
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
        </Card>
      </Box>
    </Page>
  );
};

export default AcceleratorReportView;
