import React, { useEffect, useMemo, useState } from 'react';

import { Box, Divider, Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner, Checkbox, Dropdown } from '@terraware/web-components';
import { DateTime } from 'luxon';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import DatePicker from 'src/components/common/DatePicker';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { Statuses } from 'src/redux/features/asyncUtils';
import strings from 'src/strings';
import { PlantingSite, PlantingSiteWithReportedPlants } from 'src/types/Tracking';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ObservationSubzoneSelector from './ObservationSubzoneSelector';

export type ScheduleObservationFormProps = {
  cancelID: string;
  endDate?: string;
  title: string;
  onCancel: () => void;
  onChangeSelectedSubzones?: (requestedSubzoneIds: number[]) => void;
  onEndDate: (value: string) => void;
  onErrors: (hasErrors: boolean) => void;
  onPlantingSiteId: (siteId: number) => void;
  onSave: () => void;
  onStartDate: (value: string) => void;
  plantingSiteId?: number;
  plantingSites: PlantingSite[];
  saveID: string;
  selectedPlantingSite?: PlantingSiteWithReportedPlants;
  startDate?: string;
  status?: Statuses;
  validate?: boolean;
};

export default function ScheduleObservationForm({
  cancelID,
  endDate,
  title,
  plantingSiteId,
  plantingSites,
  onCancel,
  onChangeSelectedSubzones,
  onEndDate,
  onErrors,
  onPlantingSiteId,
  onSave,
  onStartDate,
  saveID,
  selectedPlantingSite,
  startDate,
  status,
  validate,
}: ScheduleObservationFormProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const [startDateError, setStartDateError] = useState<string>();
  const [endDateError, setEndDateError] = useState<string>();
  const [limitObservation, setLimitObservation] = useState(false);

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
      } else if (end <= start || end > twoMonthsFromStart) {
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

            {onChangeSelectedSubzones && (
              <>
                <Grid item xs={12}>
                  <Checkbox
                    id='limitObservation'
                    name='Limit Observation'
                    label={strings.LIMIT_OBSERVATION_LABEL}
                    value={limitObservation}
                    onChange={(value) => setLimitObservation(value)}
                  />
                </Grid>

                {limitObservation && selectedPlantingSite && (
                  <Grid item xs={12}>
                    <ObservationSubzoneSelector
                      onChangeSelectedSubzones={onChangeSelectedSubzones}
                      plantingSite={selectedPlantingSite}
                    />
                  </Grid>
                )}
              </>
            )}

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={gridSize()}>
              <DatePicker
                id='startDate'
                label={strings.OBSERVATION_START_DATE}
                value={startDate ?? ''}
                onChange={(value) => {
                  if (value) {
                    onStartDate(value.toISOString());
                  }
                }}
                aria-label='date-picker'
                errorText={validate ? startDateError : ''}
              />
            </Grid>

            <Grid item xs={gridSize()}>
              <DatePicker
                id='endDate'
                label={strings.OBSERVATION_END_DATE}
                value={endDate ?? ''}
                onChange={(value) => {
                  if (value) {
                    onEndDate(value.toISOString());
                  }
                }}
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
