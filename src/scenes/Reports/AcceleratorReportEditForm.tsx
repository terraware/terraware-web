import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import AdditionalCommentsBox from 'src/components/AcceleratorReports/AdditionalCommentsBox';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import FinancialSummariesBox from 'src/components/AcceleratorReports/FinancialSummaryBox';
import HighlightsBox from 'src/components/AcceleratorReports/HighlightsBox';
import MetricBox from 'src/components/AcceleratorReports/MetricBox';
import PhotosBox from 'src/components/AcceleratorReports/PhotosBox';
import Card from 'src/components/common/Card';
import WrappedPageForm from 'src/components/common/PageForm';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import {
  AcceleratorReportPayload,
  ReportProjectMetricPayload,
  ReportStandardMetricPayload,
  ReportSystemMetricPayload,
  useUpdateAcceleratorReportValuesMutation,
} from 'src/queries/generated/reports';
import { useBatchReportPhotosMutation } from 'src/queries/reports/photos';
import { AcceleratorReportPhoto, MetricType, NewAcceleratorReportPhoto } from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

type AcceleratorReportPhotoActions = {
  toAdd: NewAcceleratorReportPhoto[];
  toDelete: AcceleratorReportPhoto[];
  toUpdate: AcceleratorReportPhoto[];
};

type AcceleratorReportEditFormProps = {
  report: AcceleratorReportPayload;
};

const AcceleratorReportEditForm = ({ report }: AcceleratorReportEditFormProps) => {
  const { currentAcceleratorProject, setCurrentAcceleratorProject } = useParticipantData();
  const theme = useTheme();
  const { strings } = useLocalization();
  const { goToAcceleratorReport } = useNavigateTo();

  const pathParams = useParams<{ projectId: string; reportId: string }>();
  const reportId = Number(pathParams.reportId);
  const projectId = Number(pathParams.projectId);

  const year = useMemo(() => {
    return Number(report.startDate.split('-')[0]);
  }, [report]);

  const [record, , onChange, onChangeCallback] = useForm<AcceleratorReportPayload>(report);
  const [validate, setValidate] = useState(false);
  const [updateReport, updateReportResponse] = useUpdateAcceleratorReportValuesMutation();
  const [batchReportPhotos, { isLoading: isBatchReportPhotosLoading }] = useBatchReportPhotosMutation();
  const [photos, setPhotos] = useState<AcceleratorReportPhotoActions>({ toAdd: [], toDelete: [], toUpdate: [] });
  const snackbar = useSnackbar();

  const goToReport = useCallback(() => {
    goToAcceleratorReport(Number(reportId), Number(projectId));
  }, [goToAcceleratorReport, projectId, reportId]);

  const saveReport = useCallback(() => {
    setValidate(false);
    if (record.challenges.length) {
      const missingField = record.challenges.some((chal) => {
        return (chal.challenge && !chal.mitigationPlan) || (chal.mitigationPlan && !chal.challenge);
      });
      if (missingField) {
        setValidate(true);
        return;
      }
    }

    void updateReport({
      projectId,
      reportId,
      updateAcceleratorReportValuesRequestPayload: record,
    });
  }, [projectId, record, reportId, updateReport]);

  const saveReportPhotos = useCallback(async () => {
    if (photos.toDelete.length === 0 && photos.toUpdate.length === 0 && photos.toAdd.length === 0) {
      goToReport();
    }

    try {
      await batchReportPhotos({
        projectId,
        reportId: report.id,
        photosToUpdate: photos.toUpdate,
        photosToUpload: photos.toAdd,
        fileIdsToDelete: photos.toDelete.map((photo) => photo.fileId),
      }).unwrap();

      goToReport();
    } catch (error) {
      snackbar.toastError();
    }
  }, [photos.toDelete, photos.toUpdate, photos.toAdd, batchReportPhotos, projectId, report.id, goToReport, snackbar]);

  useEffect(() => {
    if (updateReportResponse.isError) {
      snackbar.toastError();
    }
    if (updateReportResponse.isSuccess) {
      void saveReportPhotos();
    }
  }, [
    goToReport,
    projectId,
    reportId,
    saveReportPhotos,
    snackbar,
    updateReportResponse.isError,
    updateReportResponse.isSuccess,
  ]);

  useEffect(() => {
    if (projectId !== currentAcceleratorProject?.id) {
      setCurrentAcceleratorProject(projectId);
    }
  }, [currentAcceleratorProject?.id, projectId, setCurrentAcceleratorProject]);

  const onChangeMetric = useCallback(
    (
      updatedMetric: ReportProjectMetricPayload | ReportSystemMetricPayload | ReportStandardMetricPayload,
      type: MetricType
    ) => {
      switch (type) {
        case 'project': {
          const updatedProjectMetric = updatedMetric as ReportProjectMetricPayload;
          const projectMetrics = record.projectMetrics.map((projectMetric) =>
            projectMetric.id === updatedProjectMetric.id ? updatedProjectMetric : projectMetric
          );
          onChange('projectMetrics', projectMetrics);
          return;
        }
        case 'standard': {
          const updatedStandardMetric = updatedMetric as ReportStandardMetricPayload;
          const standardMetrics = record.standardMetrics.map((standardMetric) =>
            standardMetric.id === updatedStandardMetric.id ? updatedStandardMetric : standardMetric
          );
          onChange('standardMetrics', standardMetrics);
          return;
        }
        case 'system': {
          const updatedSystemMetric = updatedMetric as ReportSystemMetricPayload;
          const systemMetrics = record.systemMetrics.map((systemMetric) =>
            systemMetric.metric === updatedSystemMetric.metric ? updatedSystemMetric : systemMetric
          );
          onChange('systemMetrics', systemMetrics);
          return;
        }
      }
    },
    [onChange, record]
  );

  const onChangePhotosCallback = useCallback((value: any) => {
    setPhotos(value as AcceleratorReportPhotoActions);
  }, []);

  const isBusy = useMemo(() => {
    return updateReportResponse.isLoading;
  }, [updateReportResponse.isLoading]);

  return (
    <WrappedPageForm
      busy={isBusy}
      cancelID={'cancelEditAcceleratorReport'}
      onCancel={goToReport}
      onSave={saveReport}
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
            editing={true}
            onChange={onChangeCallback('highlights')}
          />
          {record.systemMetrics.map((metric, index) => {
            return (
              <MetricBox
                editing={true}
                key={`system-${index}`}
                metric={metric}
                onChangeMetric={onChangeMetric}
                projectId={projectId}
                reportId={reportId}
                type={'system'}
                year={year}
              />
            );
          })}
          {record.projectMetrics.map((metric, index) => {
            return (
              <MetricBox
                editing={true}
                key={`project-${index}`}
                metric={metric}
                onChangeMetric={onChangeMetric}
                projectId={projectId}
                reportId={reportId}
                type={'project'}
                year={year}
              />
            );
          })}
          {record.standardMetrics.map((metric, index) => {
            return (
              <MetricBox
                editing={true}
                key={`standard-${index}`}
                metric={metric}
                onChangeMetric={onChangeMetric}
                projectId={projectId}
                reportId={reportId}
                type={'standard'}
                year={year}
              />
            );
          })}
          <AchievementsBox
            report={record}
            projectId={projectId}
            editing={true}
            onChange={onChangeCallback('achievements')}
          />
          <ChallengesMitigationBox
            report={record}
            projectId={projectId}
            editing={true}
            onChange={onChangeCallback('challenges')}
            validate={validate}
          />
          <FinancialSummariesBox
            report={record}
            projectId={projectId}
            editing={true}
            onChange={onChangeCallback('financialSummaries')}
          />
          <AdditionalCommentsBox
            report={record}
            projectId={projectId}
            editing={true}
            onChange={onChangeCallback('additionalComments')}
          />
          <PhotosBox report={report} projectId={projectId} editing={true} onChange={onChangePhotosCallback} />
          {isBatchReportPhotosLoading && <BusySpinner />}
        </Card>
      </Box>
    </WrappedPageForm>
  );
};

export default AcceleratorReportEditForm;
