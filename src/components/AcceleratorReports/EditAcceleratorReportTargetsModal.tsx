import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Grid, Typography } from '@mui/material';
import _ from 'lodash';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useUser } from 'src/providers/hooks';
import {
  selectReviewManyAcceleratorReportMetrics,
  selectUpdateManyAcceleratorReports,
} from 'src/redux/features/reports/reportsSelectors';
import {
  requestReviewManyAcceleratorReportMetrics,
  requestUpdateManyAcceleratorReports,
} from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import {
  AcceleratorReport,
  ReportProjectMetricEntries,
  ReportStandardMetricEntries,
  ReportSystemMetricEntries,
  ReviewAcceleratorReportMetricsRequest,
  ReviewManyAcceleratorReportMetricsRequest,
  SystemMetricName,
} from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { RowMetric } from './AcceleratorReportTargetsTable';

export interface EditTargetsModalProp {
  onClose: () => void;
  reload: () => void;
  reports: AcceleratorReport[];
  row: RowMetric;
}

export default function EditAcceleratorReportTargetsModal({
  onClose,
  reload,
  reports,
  row,
}: EditTargetsModalProp): JSX.Element {
  const { isAllowed } = useUser();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { currentParticipantProject } = useParticipantData();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = isAcceleratorRoute ? Number(pathParams.projectId) : currentParticipantProject?.id;

  const [record, , onChange] = useForm<RowMetric>(row);
  const [reviewRequestId, setReviewRequestId] = useState<string>('');
  const [updateRequestId, setUpdateRequestId] = useState<string>('');

  const updateReportMetricsResponse = useAppSelector(selectReviewManyAcceleratorReportMetrics(reviewRequestId));
  const updateReportsResponse = useAppSelector(selectUpdateManyAcceleratorReports(updateRequestId));

  const isAllowedReviewReportTargets = useMemo(() => isAllowed('REVIEW_REPORTS_TARGETS'), [isAllowed]);

  const reportsById = useMemo(() => {
    const reportsByIdMap: Record<number, AcceleratorReport> = {};
    reports.forEach((report) => {
      reportsByIdMap[report.id] = report;
    });
    return reportsByIdMap;
  }, [reports]);

  useEffect(() => {
    if (updateReportMetricsResponse?.status === 'error') {
      snackbar.toastError();
    } else if (updateReportMetricsResponse?.status === 'success') {
      onClose();
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      reload();
    }
  }, [updateReportMetricsResponse, snackbar]);

  useEffect(() => {
    if (updateReportsResponse?.status === 'error') {
      snackbar.toastError();
    } else if (updateReportsResponse?.status === 'success') {
      onClose();
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      reload();
    }
  }, [updateReportsResponse, snackbar]);

  const save = () => {
    if (!projectId) {
      return;
    }

    const getUpdateBody = (quarter: 'q1' | 'q2' | 'q3' | 'q4' | 'annual') => {
      const propToRead: 'q1Target' | 'q2Target' | 'q3Target' | 'q4Target' | 'annualTarget' = `${quarter}Target`;
      if (row.metricType === 'system') {
        return {
          systemMetrics: [
            {
              metric: row.name as SystemMetricName,
              target: record[propToRead],
            },
          ],
          projectMetrics: [],
          standardMetrics: [],
        };
      } else if (row.metricType === 'project') {
        return { projectMetrics: [{ id: row.id, target: record[propToRead] }], systemMetrics: [], standardMetrics: [] };
      } else {
        return { standardMetrics: [{ id: row.id, target: record[propToRead] }], projectMetrics: [], systemMetrics: [] };
      }
    };

    const requests: ReviewAcceleratorReportMetricsRequest[] = [];
    if (row.annualReportId) {
      requests.push({ ...getUpdateBody('annual'), reportId: row.annualReportId });
    }
    if (row.q1ReportId) {
      requests.push({ ...getUpdateBody('q1'), reportId: row.q1ReportId });
    }
    if (row.q2ReportId) {
      requests.push({ ...getUpdateBody('q2'), reportId: row.q2ReportId });
    }
    if (row.q3ReportId) {
      requests.push({ ...getUpdateBody('q3'), reportId: row.q3ReportId });
    }
    if (row.q4ReportId) {
      requests.push({ ...getUpdateBody('q4'), reportId: row.q4ReportId });
    }

    const requestPayload: ReviewManyAcceleratorReportMetricsRequest = {
      requests,
      projectId,
    };

    if (isAllowedReviewReportTargets) {
      const reviewRequest = dispatch(requestReviewManyAcceleratorReportMetrics(requestPayload));
      setReviewRequestId(reviewRequest.requestId);
    } else {
      const updateManyReportsRequests = requests
        .map((request) => {
          const report = reportsById[request.reportId];
          const reportClone = _.cloneDeep(report);

          ['projectMetrics', 'standardMetrics', 'systemMetrics'].forEach((metricType) => {
            const reportMetrics = reportClone?.[metricType as keyof AcceleratorReport] as (
              | ReportProjectMetricEntries
              | ReportStandardMetricEntries
              | ReportSystemMetricEntries
            )[];
            const requestMetrics = request[metricType as keyof ReviewAcceleratorReportMetricsRequest];
            if (!Array.isArray(reportMetrics) || !Array.isArray(requestMetrics)) {
              return;
            }

            requestMetrics.forEach((metric) => {
              const reportMetricIndex =
                metricType === 'systemMetrics'
                  ? reportMetrics.findIndex(
                      (m) => (m as ReportSystemMetricEntries).metric === (metric as ReportSystemMetricEntries).metric
                    )
                  : reportMetrics.findIndex(
                      (m) => (m as ReportStandardMetricEntries).id === (metric as ReportStandardMetricEntries).id
                    );
              const reportMetric = reportMetrics[reportMetricIndex];
              if (typeof reportMetric !== 'object' || typeof metric !== 'object') {
                return;
              }

              // if target value is unchanged, we don't need to update
              if (metric.target === reportMetric.target) {
                return;
              }

              const reportMetricUpdate = {
                ...reportMetric,
                ...metric,
              };
              reportMetrics[reportMetricIndex] = reportMetricUpdate;
            });
          });

          return {
            projectId,
            report: reportClone,
            reportId: request.reportId,
          };
        })
        .filter((request) => {
          const report = reportsById[request.reportId];
          // if request.report is unchanged, we don't need to update
          if (report && _.isEqual(report, request.report)) {
            return false;
          }
          return true;
        });

      if (!updateManyReportsRequests.length) {
        onClose();
      } else {
        const updateRequest = dispatch(requestUpdateManyAcceleratorReports({ requests: updateManyReportsRequests }));
        setUpdateRequestId(updateRequest.requestId);
      }
    }
  };

  const isFieldDisabled = useCallback(
    (reportId?: number) => {
      if (!reportId) {
        return true;
      }

      const report = reportsById[reportId];
      if (!report) {
        return true;
      }

      return !isAllowedReviewReportTargets && !(report.status === 'Not Submitted' || report.status === 'Needs Update');
    },
    [isAllowedReviewReportTargets, reports, reportsById]
  );

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.METRIC_TARGET}
      size='medium'
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button id='save' onClick={save} label={strings.SAVE} key='button-2' />,
      ]}
      message={strings.METRIC_TARGET_MESSAGE}
    >
      <Grid container textAlign={'left'} spacing={2}>
        <Grid item xs={12}>
          <Typography fontWeight={600} paddingTop={2}>
            {row.name}
          </Typography>
          <Typography fontWeight={400}>{row.description}</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            disabled={isFieldDisabled(record.annualReportId)}
            id='annualTarget'
            label={strings.ANNUAL_TARGET}
            type='text'
            onChange={(value) => onChange('annualTarget', value)}
            value={record.annualTarget}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            disabled={isFieldDisabled(record.q1ReportId)}
            id='q1Target'
            label={strings.Q1_TARGET}
            type='text'
            onChange={(value) => onChange('q1Target', value)}
            value={record.q1Target}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            disabled={isFieldDisabled(record.q2ReportId)}
            id='q2Target'
            label={strings.Q2_TARGET}
            type='text'
            onChange={(value) => onChange('q2Target', value)}
            value={record.q2Target}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            disabled={isFieldDisabled(record.q3ReportId)}
            id='q3Target'
            label={strings.Q3_TARGET}
            type='text'
            onChange={(value) => onChange('q3Target', value)}
            value={record.q3Target}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            disabled={isFieldDisabled(record.q4ReportId)}
            id='q4Target'
            label={strings.Q4_TARGET}
            type='text'
            onChange={(value) => onChange('q4Target', value)}
            value={record.q4Target}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
