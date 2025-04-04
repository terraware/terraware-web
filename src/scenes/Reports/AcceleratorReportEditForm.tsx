import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Typography, useTheme } from '@mui/material';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import MetricBox, { getMetricId } from 'src/components/AcceleratorReports/MetricBox';
import Card from 'src/components/common/Card';
import WrappedPageForm from 'src/components/common/PageForm';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import strings from 'src/strings';
import { AcceleratorReport, MetricType } from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';

type AcceleratorReportEditFormProps = {
  report: AcceleratorReport;
};

const AcceleratorReportEditForm = ({ report }: AcceleratorReportEditFormProps) => {
  const { currentParticipantProject, setCurrentParticipantProject } = useParticipantData();
  const theme = useTheme();
  const { goToAcceleratorReport } = useNavigateTo();

  const pathParams = useParams<{ projectId: string; reportId: string }>();
  const reportId = String(pathParams.reportId);
  const projectId = String(pathParams.projectId);

  const [record, setRecord, onChange] = useForm<AcceleratorReport>(report);

  useEffect(() => {
    if (projectId !== currentParticipantProject?.id?.toString()) {
      setCurrentParticipantProject(projectId);
    }
  }, [currentParticipantProject?.id, projectId]);

  return (
    <WrappedPageForm
      cancelID={'cancelEditAcceleratorReport'}
      onCancel={() => {
        goToAcceleratorReport(Number(reportId), Number(projectId));
      }}
      onSave={() => {
        // TODO: save report
        goToAcceleratorReport(Number(reportId), Number(projectId));
      }}
      saveID={'saveEditAcceleratorReport'}
      saveDisabled={false}
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
                index={index}
                key={`${type}-${index}`}
                metric={metric}
                projectId={projectId}
                reload={() => {}}
                reportId={Number(reportId)}
                setEditingId={() => {}}
                type={type as MetricType}
              />
            ));
          })}
        </Card>
      </Box>
    </WrappedPageForm>
  );
};

export default AcceleratorReportEditForm;
