import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { DateTime } from 'luxon';

import DatePicker from 'src/components/common/DatePicker';
import { useLocalization } from 'src/providers';
import { ObservationPayload, useRescheduleObservationMutation } from 'src/queries/generated/observations';
import getObservationDateErrors, {
  type ObservationDateErrors,
} from 'src/scenes/ObservationsRouterV2/Schedule/getObservationDateErrors';
import useSnackbar from 'src/utils/useSnackbar';

type InlineRescheduleFormProps = {
  observation: ObservationPayload;
  onClose: () => void;
};

const InlineRescheduleForm = ({ observation, onClose }: InlineRescheduleFormProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const snackbar = useSnackbar();

  const [startDate, setStartDate] = useState<string | undefined>(observation.startDate);
  const [endDate, setEndDate] = useState<string | undefined>(observation.endDate);
  const [errors, setErrors] = useState<ObservationDateErrors>({});

  const [reschedule, rescheduleResponse] = useRescheduleObservationMutation();

  useEffect(() => {
    if (rescheduleResponse.isError) {
      snackbar.toastError();
    } else if (rescheduleResponse.isSuccess) {
      snackbar.toastSuccess(strings.OBSERVATION_RESCHEDULED);
      onClose();
    }
  }, [onClose, rescheduleResponse.isError, rescheduleResponse.isSuccess, snackbar, strings.OBSERVATION_RESCHEDULED]);

  const onStartDateChange = useCallback((value?: DateTime) => setStartDate(value?.toISODate() || undefined), []);
  const onEndDateChange = useCallback((value?: DateTime) => setEndDate(value?.toISODate() || undefined), []);

  const onSave = useCallback(() => {
    const dateErrors = getObservationDateErrors(startDate, endDate);
    setErrors(dateErrors);
    if (startDate && endDate && !dateErrors.startDateError && !dateErrors.endDateError) {
      void reschedule({
        observationId: observation.id,
        rescheduleObservationRequestPayload: { startDate, endDate },
      });
    }
  }, [endDate, observation.id, reschedule, startDate]);

  return (
    <Box marginTop={theme.spacing(1)}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <DatePicker
            aria-label='date-picker'
            errorText={errors.startDateError}
            id={`reschedule-start-date-${observation.id}`}
            label={strings.START_DATE}
            minDate={DateTime.now().toISODate()}
            onDateChange={onStartDateChange}
            value={startDate ?? ''}
          />
        </Grid>
        <Grid item xs={6}>
          <DatePicker
            aria-label='date-picker'
            errorText={errors.endDateError}
            id={`reschedule-end-date-${observation.id}`}
            label={strings.END_DATE}
            onDateChange={onEndDateChange}
            value={endDate ?? ''}
          />
        </Grid>
      </Grid>
      <Box
        sx={{
          display: 'flex',
          gap: theme.spacing(1),
          justifyContent: 'flex-end',
          marginTop: theme.spacing(2),
        }}
      >
        <Button
          disabled={rescheduleResponse.isLoading}
          id={`reschedule-cancel-${observation.id}`}
          label={strings.CANCEL}
          onClick={onClose}
          priority='ghost'
          size='small'
        />
        <Button
          id={`reschedule-save-${observation.id}`}
          label={strings.SAVE}
          onClick={onSave}
          processing={rescheduleResponse.isLoading}
          size='small'
        />
      </Box>
    </Box>
  );
};

export default InlineRescheduleForm;
