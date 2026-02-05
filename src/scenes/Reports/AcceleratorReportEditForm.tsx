import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import AdditionalCommentsBox from 'src/components/AcceleratorReports/AdditionalCommentsBox';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import FinancialSummariesBox from 'src/components/AcceleratorReports/FinancialSummaryBox';
import HighlightsBox from 'src/components/AcceleratorReports/HighlightsBox';
import MetricBox, { isReportSystemMetric } from 'src/components/AcceleratorReports/MetricBox';
import PhotosBox from 'src/components/AcceleratorReports/PhotosBox';
import Card from 'src/components/common/Card';
import WrappedPageForm from 'src/components/common/PageForm';
import useNavigateTo from 'src/hooks/useNavigateTo';
import useProjectReports from 'src/hooks/useProjectReports';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import {
  selectDeleteManyAcceleratorReportPhotos,
  selectUpdateAcceleratorReport,
  selectUpdateManyAcceleratorReportPhotos,
  selectUploadManyAcceleratorReportPhotos,
} from 'src/redux/features/reports/reportsSelectors';
import {
  requestDeleteManyAcceleratorReportPhotos,
  requestUpdateAcceleratorReport,
  requestUpdateManyAcceleratorReportPhotos,
  requestUploadManyAcceleratorReportPhotos,
} from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import {
  AcceleratorReport,
  AcceleratorReportPhoto,
  MetricType,
  NewAcceleratorReportPhoto,
  ReportProjectMetric,
  ReportStandardMetric,
  ReportSystemMetric,
} from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

type AcceleratorReportPhotoActions = {
  toAdd: NewAcceleratorReportPhoto[];
  toDelete: AcceleratorReportPhoto[];
  toUpdate: AcceleratorReportPhoto[];
};

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

  const { getYearTarget } = useProjectReports(projectId, true, true);
  const year = useMemo(() => {
    return report?.startDate.split('-')[0];
  }, [report]);

  const [record, , onChange, onChangeCallback] = useForm<AcceleratorReport>(report);
  const [validate, setValidate] = useState(false);
  const [photos, setPhotos] = useState<AcceleratorReportPhotoActions>({ toAdd: [], toDelete: [], toUpdate: [] });
  const [saveReportRequestId, setSaveReportRequestId] = useState('');
  const saveReportResponse = useAppSelector(selectUpdateAcceleratorReport(saveReportRequestId));
  const snackbar = useSnackbar();

  const [photosDispatched, setPhotosDispatched] = useState(false);
  const [deletePhotosRequestId, setDeletePhotosRequestId] = useState<string>('');
  const [updatePhotosRequestId, setUpdatePhotosRequestId] = useState<string>('');
  const [uploadPhotosRequestId, setUploadPhotosRequestId] = useState<string>('');

  const deletePhotosResult = useAppSelector(selectDeleteManyAcceleratorReportPhotos(deletePhotosRequestId));
  const updatePhotosResult = useAppSelector(selectUpdateManyAcceleratorReportPhotos(updatePhotosRequestId));
  const uploadPhotosResult = useAppSelector(selectUploadManyAcceleratorReportPhotos(uploadPhotosRequestId));

  const goToReport = useCallback(() => {
    goToAcceleratorReport(Number(reportId), Number(projectId));
  }, [goToAcceleratorReport, projectId, reportId]);

  const saveReportPhotos = useCallback(() => {
    let nextDispatched = false;
    if (photos.toDelete.length) {
      const deleteDispatch = dispatch(
        requestDeleteManyAcceleratorReportPhotos({
          projectId,
          reportId: report.id.toString(),
          fileIds: photos.toDelete.map((photo) => photo.fileId.toString()),
        })
      );
      setDeletePhotosRequestId(deleteDispatch.requestId);
      nextDispatched = true;
    }

    if (photos.toUpdate.length) {
      const updateDispatch = dispatch(
        requestUpdateManyAcceleratorReportPhotos({
          projectId,
          reportId: report.id.toString(),
          photos: photos.toUpdate,
        })
      );
      setUpdatePhotosRequestId(updateDispatch.requestId);
      nextDispatched = true;
    }

    if (photos.toAdd.length) {
      const uploadDispatch = dispatch(
        requestUploadManyAcceleratorReportPhotos({
          projectId,
          reportId: report.id.toString(),
          photos: photos.toAdd,
        })
      );
      setUploadPhotosRequestId(uploadDispatch.requestId);
      nextDispatched = true;
    }

    setPhotosDispatched(nextDispatched);
    return nextDispatched;
  }, [report, photos, dispatch, projectId]);

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
    const request = dispatch(
      requestUpdateAcceleratorReport({
        projectId: Number(projectId),
        reportId: Number(reportId),
        report: record,
      })
    );
    setSaveReportRequestId(request.requestId);
  }, [dispatch, projectId, record, reportId]);

  useEffect(() => {
    if (saveReportResponse?.status === 'error') {
      snackbar.toastError();
    }
    if (saveReportResponse?.status === 'success') {
      if (!saveReportPhotos()) {
        // If no photos update has occured
        goToReport();
      } // else, wait for second effect to navigate back
    }
  }, [goToReport, projectId, reportId, saveReportPhotos, saveReportResponse, snackbar]);

  useEffect(() => {
    if (photosDispatched) {
      const deletePhotosPending = deletePhotosResult ? deletePhotosResult.status === 'pending' : false;
      const updatePhotosPending = updatePhotosResult ? updatePhotosResult.status === 'pending' : false;
      const uploadPhotosPending = uploadPhotosResult ? uploadPhotosResult.status === 'pending' : false;

      if (deletePhotosPending || updatePhotosPending || uploadPhotosPending) {
        return;
      }

      const deletePhotosError = deletePhotosResult ? deletePhotosResult.status !== 'success' : false;
      const updatePhotosError = updatePhotosResult ? updatePhotosResult.status !== 'success' : false;
      const uploadPhotosError = uploadPhotosResult ? uploadPhotosResult.status !== 'success' : false;

      if (deletePhotosError || updatePhotosError || uploadPhotosError) {
        snackbar.toastError();
      } else {
        snackbar.toastSuccess(strings.CHANGES_SAVED);
      }

      // Error or not, navigate back and force reload, becasue the report is partially updated
      goToReport();
    }
  }, [deletePhotosResult, goToReport, photosDispatched, snackbar, updatePhotosResult, uploadPhotosResult]);

  useEffect(() => {
    if (projectId !== currentParticipantProject?.id?.toString()) {
      setCurrentParticipantProject(projectId);
    }
  }, [currentParticipantProject?.id, projectId, setCurrentParticipantProject]);

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
    [onChange, record]
  );

  const onChangePhotosCallback = useCallback((value: any) => {
    setPhotos(value as AcceleratorReportPhotoActions);
  }, []);

  const isBusy = useMemo(() => {
    return (
      saveReportResponse?.status === 'pending' ||
      deletePhotosResult?.status === 'pending' ||
      updatePhotosResult?.status === 'pending' ||
      uploadPhotosResult?.status === 'pending'
    );
  }, [deletePhotosResult?.status, saveReportResponse?.status, updatePhotosResult?.status, uploadPhotosResult?.status]);

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
          {['system', 'project', 'standard'].map((type) => {
            const metrics =
              type === 'system'
                ? record.systemMetrics
                : type === 'project'
                  ? record.projectMetrics
                  : record.standardMetrics;

            return metrics?.map((metric, index) => (
              <MetricBox
                editing={true}
                key={`${type}-${index}`}
                metric={metric}
                onChangeMetric={onChangeMetric}
                projectId={projectId}
                reportId={Number(reportId)}
                type={type as MetricType}
                year={year}
                yearTarget={getYearTarget(metric, type as MetricType, year)}
              />
            ));
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
        </Card>
      </Box>
    </WrappedPageForm>
  );
};

export default AcceleratorReportEditForm;
