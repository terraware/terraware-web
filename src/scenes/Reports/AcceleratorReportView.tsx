import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import ApprovedReportMessage from 'src/components/AcceleratorReports/ApprovedReportMessage';
import MetricBox from 'src/components/AcceleratorReports/MetricBox';
import RejectedReportMessage from 'src/components/AcceleratorReports/RejectedReportMessage';
import TargetsMustBeSetMessage from 'src/components/AcceleratorReports/TargetsMustBeSetMessage';
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

  const year = useMemo(() => {
    return selectedReport?.startDate.split('-')[0];
  }, [selectedReport]);

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.REPORTS : '',
        to: year ? `${APP_PATHS.REPORTS}?year=${year}` : APP_PATHS.REPORTS,
      },
    ],
    [activeLocale, year]
  );

  const targetsAreSet = useMemo(() => {
    const allMetrics = [
      ...(selectedReport?.systemMetrics || []),
      ...(selectedReport?.projectMetrics || []),
      ...(selectedReport?.standardMetrics || []),
    ];

    const allMetricsHaveTargets = allMetrics.every((metric) => metric.target !== undefined && metric.target !== null);

    return !!allMetrics.length && allMetricsHaveTargets;
  }, [selectedReport]);

  const callToAction = useMemo(() => {
    return (
      <>
        <Button
          disabled={selectedReport?.status !== 'Not Submitted' && selectedReport?.status !== 'Needs Update'}
          icon='iconEdit'
          id='editReport'
          label={strings.EDIT}
          onClick={() => {
            // TODO: edit page
          }}
          priority='secondary'
          size='medium'
        />
        <Button
          disabled={
            (selectedReport?.status !== 'Not Submitted' && selectedReport?.status !== 'Needs Update') || !targetsAreSet
          }
          id='submitReport'
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
        {selectedReport && !targetsAreSet && <TargetsMustBeSetMessage />}
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

            if (!selectedReport) {
              return null;
            }

            return metrics?.map((metric, index) => (
              <MetricBox
                index={index}
                key={`${type}-${index}`}
                metric={metric}
                projectId={projectId}
                reload={reload}
                reportId={type === 'standard' ? selectedReport?.id : Number(reportId)}
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
