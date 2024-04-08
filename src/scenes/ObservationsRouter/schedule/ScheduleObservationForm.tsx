import React, { useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner, DatePicker, Dropdown } from '@terraware/web-components';
import { DateTime } from 'luxon';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { Statuses } from 'src/redux/features/asyncUtils';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import useDeviceInfo from 'src/utils/useDeviceInfo';

export type ScheduleObservationFormProps = {
  title: string;
  plantingSites: PlantingSite[];
  onPlantingSiteId: (siteId: number) => void;
  onStartDate: (value: string) => void;
  onEndDate: (value: string) => void;
  plantingSiteId?: number;
  startDate?: string;
  endDate?: string;
  validate?: boolean;
  onErrors: (hasErrors: boolean) => void;
  status?: Statuses;
  onCancel: () => void;
  onSave: () => void;
  saveID: string;
  cancelID: string;
};

export default function ScheduleObservationForm({
  title,
  plantingSites,
  onPlantingSiteId,
  onStartDate,
  onEndDate,
  plantingSiteId,
  startDate,
  endDate,
  validate,
  onErrors,
  status,
  onCancel,
  onSave,
  saveID,
  cancelID,
}: ScheduleObservationFormProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const [startDateError, setStartDateError] = useState<string>();
  const [endDateError, setEndDateError] = useState<string>();

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 6;
  };

  useEffect(() => {
    let startError: string = '';
    let endError: string = '';
    if (!startDate) {
      startError = strings.REQUIRED_FIELD;
    }
    if (!endDate) {
      endError = strings.REQUIRED_FIELD;
    }
    if (startDate && endDate) {
      const today = DateTime.now().startOf('day');
      const oneYearFromToday = today.plus({ years: 1 }).toMillis();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const twoMonthsFromStart = DateTime.fromMillis(start).plus({ months: 2 }).toMillis();
      if (start < today.toMillis() || start > oneYearFromToday) {
        // start should be between today and one year from today
        startError = strings.INVALID_DATE;
      } else if (end < start || end > twoMonthsFromStart) {
        // end should be between start and two months from start
        endError = strings.INVALID_DATE;
      }
    }
    setStartDateError(startError);
    setEndDateError(endError);
    const hasErrors: boolean = startError || endError || !plantingSiteId ? true : false;
    onErrors(hasErrors);
  }, [plantingSiteId, startDate, endDate, onErrors]);

  const sites = useMemo(
    () =>
      plantingSites.map((site) => ({
        label: site.name,
        value: site.id.toString(),
      })),
    [plantingSites]
  );

  return (
    <TfMain>
      {status === 'pending' && <BusySpinner withSkrim={true} />}
      <PageForm cancelID={cancelID} saveID={saveID} onCancel={onCancel} onSave={onSave}>
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
                onChange={(id) => onPlantingSiteId(Number(id))}
                options={sites}
                selectedValue={plantingSiteId?.toString()}
                errorText={validate && !plantingSiteId ? strings.REQUIRED_FIELD : ''}
                fullWidth
              />
            </Grid>
            <Grid item xs={gridSize()}>
              <DatePicker
                id='startDate'
                label={strings.OBSERVATION_START_DATE}
                value={startDate ?? ''}
                onChange={(value) => onStartDate(value as string)}
                aria-label='date-picker'
                errorText={validate ? startDateError : ''}
              />
            </Grid>
            <Grid item xs={gridSize()}>
              <DatePicker
                id='endDate'
                label={strings.OBSERVATION_END_DATE}
                value={endDate ?? ''}
                onChange={(value) => onEndDate(value as string)}
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
