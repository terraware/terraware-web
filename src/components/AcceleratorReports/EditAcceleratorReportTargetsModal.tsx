import React, { useEffect, useMemo, useState } from 'react';
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
      const updateManyReportsRequests = requests.map((request) => {
        const report = reports.find((r) => r.id === request.reportId);
        const reportClone = _.cloneDeep(report);

        ['projectMetrics', 'standardMetrics', 'systemMetrics'].forEach((metricType) => {
          const requestMetrics = request[metricType as keyof ReviewAcceleratorReportMetricsRequest];
          if (!Array.isArray(requestMetrics)) {
            return;
          }

          requestMetrics.forEach((metric) => {
            const reportMetrics = reportClone?.[metricType as keyof AcceleratorReport];
            if (!Array.isArray(reportMetrics)) {
              return;
            }

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

            const reportMetricUpdate = {
              ...reportMetric,
              ...metric,
            };
            const metrics = reportClone?.[metricType as keyof AcceleratorReport] as any[];
            metrics[reportMetricIndex] = reportMetricUpdate;
          });
        });

        return {
          projectId,
          report: reportClone as AcceleratorReport,
          reportId: request.reportId,
        };
      });

      const updateRequest = dispatch(
        requestUpdateManyAcceleratorReports({ requests: updateManyReportsRequests.filter(Boolean) })
      );
      setUpdateRequestId(updateRequest.requestId);
    }
  };

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
            id='annualTarget'
            label={strings.ANNUAL_TARGET}
            type='text'
            onChange={(value) => onChange('annualTarget', value)}
            value={record.annualTarget}
            disabled={!record.annualReportId}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='q1Target'
            label={strings.Q1_TARGET}
            type='text'
            onChange={(value) => onChange('q1Target', value)}
            value={record.q1Target}
            disabled={!record.q1ReportId}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='q2Target'
            label={strings.Q2_TARGET}
            type='text'
            onChange={(value) => onChange('q2Target', value)}
            value={record.q2Target}
            disabled={!record.q2ReportId}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='q3Target'
            label={strings.Q3_TARGET}
            type='text'
            onChange={(value) => onChange('q3Target', value)}
            value={record.q3Target}
            disabled={!record.q3ReportId}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='q4Target'
            label={strings.Q4_TARGET}
            type='text'
            onChange={(value) => onChange('q4Target', value)}
            value={record.q4Target}
            disabled={!record.q4ReportId}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
