import React, { useCallback, useMemo, useState } from 'react';

import { Box, Divider, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';
import { DateTime } from 'luxon';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import DatePicker from 'src/components/common/DatePicker';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';
import { RescheduleObservationRequestPayload } from 'src/types/Observations';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';

export type RescheduleObservationFormProps = {
  title: string;
  initialData: RescheduleObservationRequestPayload;
  onCancel: () => void;
  onSave: (formData: RescheduleObservationRequestPayload) => void;
};

export default function RescheduleObservationForm({
  title,
  initialData,
  onCancel,
  onSave,
}: RescheduleObservationFormProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const { plantingSite } = usePlantingSiteData();

  const [record, , onChange] = useForm<RescheduleObservationRequestPayload>(initialData);
  const [startDateError, setStartDateError] = useState<string>();
  const [endDateError, setEndDateError] = useState<string>();
  const [validate, setValidate] = useState<boolean>(false);

  const siteOptions = useMemo((): DropdownItem[] => {
    if (plantingSite) {
      return [
        {
          label: plantingSite.name,
          value: plantingSite.id,
        },
      ];
    } else {
      return [];
    }
  }, [plantingSite]);

  const findErrors = useCallback(() => {
    const today = DateTime.now().startOf('day');
    const oneYearFromToday = today.plus({ years: 1 }).toMillis();
    const start = new Date(record.startDate).getTime();
    const end = new Date(record.endDate).getTime();
    const twoMonthsFromStart = DateTime.fromMillis(start).plus({ months: 2 }).toMillis();
    if (start < today.toMillis() || start > oneYearFromToday) {
      // start should be between today and one year from today
      setStartDateError(strings.INVALID_DATE);
      return true;
    } else if (end <= start || end > twoMonthsFromStart) {
      // end should be between start and two months from start
      setEndDateError(strings.INVALID_DATE);
      return true;
    } else {
      setStartDateError(undefined);
      setEndDateError(undefined);
      return false;
    }
  }, [record.endDate, record.startDate]);

  const onSubmit = useCallback(() => {
    setValidate(true);
    if (!findErrors()) {
      onSave(record);
    }
  }, [findErrors, onSave, record]);

  const setDate = useCallback(
    (key: keyof RescheduleObservationRequestPayload) => (value: DateTime<boolean> | undefined) => {
      const newDate = value?.toISODate();
      if (newDate) {
        onChange(key, newDate);
      }
    },
    [onChange]
  );

  return (
    <TfMain>
      <PageForm
        cancelID={'cancelRescheduleObservation'}
        saveID={'rescheduleObservation'}
        onCancel={onCancel}
        onSave={onSubmit}
      >
        <Box marginBottom={theme.spacing(4)} paddingLeft={theme.spacing(3)}>
          <Typography fontSize='24px' fontWeight={600}>
            {title}
          </Typography>
          <PageSnackbar />
        </Box>

        <Card style={{ maxWidth: '568px', margin: 'auto' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Dropdown
                id='site'
                label={strings.PLANTING_SITE}
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                onChange={() => {}}
                options={siteOptions}
                selectedValue={plantingSite?.id}
                disabled
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={isMobile ? 12 : 6}>
              <DatePicker
                id='startDate'
                label={strings.OBSERVATION_START_DATE}
                value={record.startDate}
                onDateChange={setDate('startDate')}
                aria-label='date-picker'
                errorText={validate ? startDateError : ''}
              />
            </Grid>

            <Grid item xs={isMobile ? 12 : 6}>
              <DatePicker
                id='endDate'
                label={strings.OBSERVATION_END_DATE}
                value={record.endDate}
                onDateChange={setDate('endDate')}
                aria-label='date-picker'
                errorText={validate ? endDateError : ''}
              />
            </Grid>

            <Typography
              fontSize='14px'
              fontWeight={400}
              lineHeight='20px'
              color={theme.palette.TwClrBrdrInfo}
              padding={theme.spacing(1, 3)}
            >
              {strings.OBSERVATION_PERIOD_WARN}
            </Typography>
          </Grid>
        </Card>
      </PageForm>
    </TfMain>
  );
}
