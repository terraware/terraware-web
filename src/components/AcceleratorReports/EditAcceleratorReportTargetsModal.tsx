import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Grid, Typography } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useUser } from 'src/providers/hooks';
import { selectUpdateAcceleratorReportTargets } from 'src/redux/features/reports/reportsSelectors';
import { requestUpdateAcceleratorReportTargets } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorReport, SystemMetricName } from 'src/types/AcceleratorReport';
import {
  ReportMetricTargets,
  UpdateProjectMetricTargets,
  UpdateStandardMetricTargets,
  UpdateSystemMetricTargets,
} from 'src/types/Report';
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

  const [record, , , onChangeCallback] = useForm<RowMetric>(row);
  const [updateRequestId, setUpdateRequestId] = useState<string>('');

  const updateResponse = useAppSelector(selectUpdateAcceleratorReportTargets(updateRequestId));

  const isAllowedReviewReportTargets = useMemo(() => isAllowed('REVIEW_REPORTS_TARGETS'), [isAllowed]);

  const reportsById = useMemo(() => {
    const reportsByIdMap: Record<number, AcceleratorReport> = {};
    reports.forEach((report) => {
      reportsByIdMap[report.id] = report;
    });
    return reportsByIdMap;
  }, [reports]);

  useEffect(() => {
    if (updateResponse) {
      if (updateResponse.status === 'error') {
        snackbar.toastError();
      } else if (updateResponse.status === 'success') {
        onClose();
        snackbar.toastSuccess(strings.CHANGES_SAVED);
        reload();
      }
    }
  }, [updateResponse, snackbar, onClose, reload]);

  const save = useCallback(() => {
    if (!projectId) {
      return;
    }

    const targets: ReportMetricTargets[] = [];

    if (row.annualReportId && row.annualTarget !== record.annualTarget) {
      targets.push({ reportId: row.annualReportId, target: Number(record.annualTarget) });
    }
    if (row.q1ReportId && row.q1Target !== record.q1Target) {
      targets.push({ reportId: row.q1ReportId, target: Number(record.q1Target) });
    }
    if (row.q2ReportId && row.q2Target !== record.q2Target) {
      targets.push({ reportId: row.q2ReportId, target: Number(record.q2Target) });
    }
    if (row.q3ReportId && row.q3Target !== record.q3Target) {
      targets.push({ reportId: row.q3ReportId, target: Number(record.q3Target) });
    }
    if (row.q4ReportId && row.q4Target !== record.q4Target) {
      targets.push({ reportId: row.q4ReportId, target: Number(record.q4Target) });
    }

    let metric: UpdateProjectMetricTargets | UpdateStandardMetricTargets | UpdateSystemMetricTargets;
    switch (row.metricType) {
      case 'project':
        metric = {
          type: 'project',
          metricId: row.id,
          targets,
        };
        break;
      case 'standard':
        metric = {
          type: 'standard',
          metricId: row.id,
          targets,
        };
        break;
      case 'system':
        metric = {
          type: 'system',
          metric: row.name as SystemMetricName,
          targets,
        };
        break;
    }

    if (metric) {
      const request = dispatch(
        requestUpdateAcceleratorReportTargets({
          payload: { metric },
          projectId,
          updateSubmitted: isAllowedReviewReportTargets,
        })
      );

      setUpdateRequestId(request.requestId);
    } else {
      onClose();
    }
  }, [dispatch, isAllowedReviewReportTargets, onClose, projectId, record, row]);

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
    [isAllowedReviewReportTargets, reportsById]
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
            type='number'
            onChange={onChangeCallback('annualTarget')}
            value={record.annualTarget}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            disabled={isFieldDisabled(record.q1ReportId)}
            id='q1Target'
            label={strings.Q1_TARGET}
            type='number'
            onChange={onChangeCallback('q1Target')}
            value={record.q1Target}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            disabled={isFieldDisabled(record.q2ReportId)}
            id='q2Target'
            label={strings.Q2_TARGET}
            type='number'
            onChange={onChangeCallback('q2Target')}
            value={record.q2Target}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            disabled={isFieldDisabled(record.q3ReportId)}
            id='q3Target'
            label={strings.Q3_TARGET}
            type='number'
            onChange={onChangeCallback('q3Target')}
            value={record.q3Target}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            disabled={isFieldDisabled(record.q4ReportId)}
            id='q4Target'
            label={strings.Q4_TARGET}
            type='number'
            onChange={onChangeCallback('q4Target')}
            value={record.q4Target}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
