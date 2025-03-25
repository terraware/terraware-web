import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Grid, Typography } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { selectReviewManyAcceleratorReportMetrics } from 'src/redux/features/reports/reportsSelectors';
import { requestReviewManyAcceleratorReportMetrics } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import {
  ReviewAcceleratorReportMetricsRequest,
  ReviewManyAcceleratorReportMetricsRequest,
  SystemMetricName,
} from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { RowMetric } from './ReportsTargets';

export interface EditTargetsModalProp {
  onClose: () => void;
  reload: () => void;
  row: RowMetric;
}

export default function EditTargetsModal(props: EditTargetsModalProp): JSX.Element {
  const { onClose, row, reload } = props;
  const [requestId, setRequestId] = useState<string>('');
  const dispatch = useAppDispatch();
  const updateReportMetricsResponse = useAppSelector(selectReviewManyAcceleratorReportMetrics(requestId));
  const snackbar = useSnackbar();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const [record, , onChange] = useForm<RowMetric>(row);

  useEffect(() => {
    if (updateReportMetricsResponse?.status === 'error') {
      snackbar.toastError();
    } else if (updateReportMetricsResponse?.status === 'success') {
      onClose();
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      reload();
    }
  }, [updateReportMetricsResponse, snackbar]);

  const save = () => {
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

    const request = dispatch(requestReviewManyAcceleratorReportMetrics(requestPayload));
    setRequestId(request.requestId);
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
