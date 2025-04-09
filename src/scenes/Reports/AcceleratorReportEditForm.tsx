import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Typography, useTheme } from '@mui/material';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import HighlightsBox from 'src/components/AcceleratorReports/HighlightsBox';
import MetricBox, { getMetricId, isReportSystemMetric } from 'src/components/AcceleratorReports/MetricBox';
import Card from 'src/components/common/Card';
import WrappedPageForm from 'src/components/common/PageForm';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { selectUpdateAcceleratorReport } from 'src/redux/features/reports/reportsSelectors';
import { requestUpdateAcceleratorReport } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import {
  AcceleratorReport,
  MetricType,
  ReportProjectMetric,
  ReportStandardMetric,
  ReportSystemMetric,
} from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';

type AcceleratorReportEditFormProps = {
  report: AcceleratorReport;
};

const AcceleratorReportEditForm = ({ report }: AcceleratorReportEditFormProps) => {
  const { currentParticipantProject, setCurrentParticipantProject } = useParticipantData();
  const theme = useTheme();
  const { goToAcceleratorReport } = useNavigateTo();
  const dispatch = useAppDispatch();

  const pathParams = useParams<{ projectId: string; reportId: string }>();
  const reportId = String(pathParams.reportId);
  const projectId = String(pathParams.projectId);

  const [record, , onChange] = useForm<AcceleratorReport>(report);
  const [saveReportRequestId, setSaveReportRequestId] = useState('');
  const saveReportResponse = useAppSelector(selectUpdateAcceleratorReport(saveReportRequestId));

  const saveReport = () => {
    const request = dispatch(
      requestUpdateAcceleratorReport({
        projectId: Number(projectId),
        reportId: Number(reportId),
        report: record,
      })
    );
    setSaveReportRequestId(request.requestId);
  };

  useEffect(() => {
    if (saveReportResponse?.status === 'error') {
      return;
    }
    if (saveReportResponse?.status === 'success') {
      goToAcceleratorReport(Number(reportId), Number(projectId));
    }
  }, [projectId, reportId, saveReportResponse]);

  useEffect(() => {
    if (projectId !== currentParticipantProject?.id?.toString()) {
      setCurrentParticipantProject(projectId);
    }
  }, [currentParticipantProject?.id, projectId]);

  const onChangeMetric = useCallback(
    (metric: ReportProjectMetric | ReportSystemMetric | ReportStandardMetric, type: MetricType) => {
      const key = `${type}Metrics`;
      const metricsToUpdate = record[`${type}Metrics`];
      const updatedMetrics = metricsToUpdate?.map((m) => {
        if (isReportSystemMetric(m)) {
          return m.metric === (metric as ReportSystemMetric).metric ? { ...m, ...metric } : m;
        } else {
          return m.id === (metric as ReportProjectMetric | ReportStandardMetric).id ? { ...m, ...metric } : m;
        }
      });
      onChange(key, updatedMetrics);
    },
    [onChange]
  );

  return (
    <WrappedPageForm
      busy={saveReportResponse?.status === 'pending'}
      cancelID={'cancelEditAcceleratorReport'}
      onCancel={() => {
        goToAcceleratorReport(Number(reportId), Number(projectId));
      }}
      onSave={() => {
        saveReport();
      }}
      saveID={'saveEditAcceleratorReport'}
      saveDisabled={false}
      style={{ width: '100%' }}
    >
      <Box display='flex' flexDirection='column' flexGrow={1} overflow={'auto'}>
        <Card
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          }}
        >
          {record.startDate && record.endDate && (
            <Box
              borderBottom={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
              padding={theme.spacing(3, 0)}
              marginBottom={3}
            >
              <div style={{ float: 'right', marginBottom: '0px', marginLeft: '16px' }}>
                <AcceleratorReportStatusBadge status={record.status} />
              </div>

              <Typography fontSize={14} fontStyle={'italic'}>
                {strings.formatString(strings.REPORT_PERIOD, record.startDate, record.endDate)}
              </Typography>
            </Box>
          )}
          <HighlightsBox
            report={record}
            projectId={projectId}
            reportId={reportId}
            editing={true}
            onChange={(value: any) => onChange('highlights', value)}
          />
          {['system', 'project', 'standard'].map((type) => {
            const metrics =
              type === 'system'
                ? record.systemMetrics
                : type === 'project'
                  ? record.projectMetrics
                  : record.standardMetrics;

            return metrics?.map((metric, index) => (
              <MetricBox
                editingId={getMetricId(metric, type as MetricType)}
                key={`${type}-${index}`}
                metric={metric}
                onChangeMetric={onChangeMetric}
                projectId={projectId}
                reportId={Number(reportId)}
                setEditingId={() => {}}
                type={type as MetricType}
              />
            ));
          })}
          <AchievementsBox
            report={record}
            projectId={projectId}
            reportId={reportId}
            editing={true}
            onChange={(value: any) => onChange('achievements', value)}
          />
          <ChallengesMitigationBox
            report={record}
            projectId={projectId}
            reportId={reportId}
            editing={true}
            onChange={(value: any) => onChange('challenges', value)}
          />
        </Card>
      </Box>
    </WrappedPageForm>
  );
};

export default AcceleratorReportEditForm;
