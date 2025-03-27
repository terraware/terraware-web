import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Grid, Typography } from '@mui/material';

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

export interface EditProgressModalProps {
  onClose: () => void;
  onChange: (value: string) => void;
  value?: number;
  metricName: string;
  target: number;
}

export default function EditProgressModal(props: EditProgressModalProps): JSX.Element {
  const { onClose, onChange, value, metricName, target } = props;

  const [newProgress, setNewProgress] = useState(value);

  const save = () => {
    onChange(newProgress.toString());
  };

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={metricName}
      size='small'
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
    >
      <Grid container textAlign={'left'} spacing={2}>
        <Grid item xs={12}>
          <Box display={'flex'} alignItems={'center'}>
            <TextField
              type='text'
              label={strings.PROGRESS}
              value={newProgress}
              id={'progress'}
              onChange={(value: any) => setNewProgress(value)}
            />
            {
              <Typography paddingTop={3}>
                / {target} ({strings.TARGET})
              </Typography>
            }
          </Box>
        </Grid>
      </Grid>
    </DialogBox>
  );
}
