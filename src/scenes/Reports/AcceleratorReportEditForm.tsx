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
          {['system', 'project', 'standard'].map((type) => {
            const metrics =
              type === 'system'
                ? report?.systemMetrics
                : type === 'project'
                  ? report?.projectMetrics
                  : report?.standardMetrics;

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
