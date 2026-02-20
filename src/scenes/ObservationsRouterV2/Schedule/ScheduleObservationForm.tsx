import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Divider, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';
import { DateTime } from 'luxon';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import DatePicker from 'src/components/common/DatePicker';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { useLocalization } from 'src/providers';
import {
  RescheduleObservationRequestPayload,
  ScheduleObservationRequestPayload,
  useLazyGetObservationQuery,
} from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import SmallSiteWarningDialog from 'src/scenes/ObservationsRouter/schedule/SmallSiteWarningDialog';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ObservationSubstratumSelector from './ObservationSubstratumSelector';
import useObservablePlantingSites from './useObservablePlantingSites';

const WARN_IF_SITE_LESS_THAN_HECTARES = 3.0;

export type ScheduleObservationFormProps = {
  title: string;
  onCancel: () => void;
  onSchedule?: (formData: ScheduleObservationRequestPayload) => void;
  onReschedule?: (formData: RescheduleObservationRequestPayload) => void;

  // If observation ID is specified, it will be a reschedule
  observationId?: number;
};

export default function ScheduleObservationForm({
  title,
  onCancel,
  onSchedule,
  onReschedule,
  observationId,
}: ScheduleObservationFormProps): JSX.Element {
  const { activeLocale, strings } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number>();
  const [getPlantingSite, getPlantingSiteResponse] = useLazyGetPlantingSiteQuery();
  const [getObservation, getObservationResponse] = useLazyGetObservationQuery();

  const observableSites = useObservablePlantingSites();

  const targetObservation = useMemo(
    () => getObservationResponse.data?.observation,
    [getObservationResponse.data?.observation]
  );

  const plantingSite = useMemo(() => getPlantingSiteResponse.data?.site, [getPlantingSiteResponse.data?.site]);
  const selectedSite = useMemo(
    () => observableSites.find((site) => site.id === selectedPlantingSiteId),
    [observableSites, selectedPlantingSiteId]
  );

  useEffect(() => {
    if (observationId) {
      void getObservation(observationId, true);
    }
  }, [getObservation, observationId]);

  useEffect(() => {
    if (targetObservation) {
      void getPlantingSite(targetObservation.plantingSiteId, true);
    }
  });

  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [requestedSubstratumIds, setRequestedSubstratumIds] = useState<number[]>();

  const [validate, setValidate] = useState<boolean>(false);
  const [startDateError, setStartDateError] = useState<string>();
  const [endDateError, setEndDateError] = useState<string>();
  const [substratumError, setSubstratumError] = useState<string>();
  const [showSmallSiteWarning, setShowSmallSiteWarning] = useState<boolean>();

  const siteOptions = useMemo((): DropdownItem[] => {
    if (plantingSite) {
      return [
        {
          label: plantingSite.name,
          value: plantingSite.id,
        },
      ];
    } else {
      return observableSites
        .toSorted((a, b) => a.name.localeCompare(b.name, activeLocale || undefined))
        .map((site) => ({
          label: site.name,
          value: site.id,
        }));
    }
  }, [activeLocale, plantingSite, observableSites]);

  const findErrors = useCallback(() => {
    let _startDateError: string = '';
    let _endDateError: string = '';
    let _substratumError: string = '';
    if (!startDate) {
      _startDateError = strings.REQUIRED_FIELD;
    }
    if (!endDate) {
      _endDateError = strings.REQUIRED_FIELD;
    }
    if (startDate && endDate) {
      const today = DateTime.now().startOf('day');
      const oneYearFromToday = today.plus({ years: 1 }).toMillis();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const twoMonthsFromStart = DateTime.fromMillis(start).plus({ months: 2 }).toMillis();
      if (start < today.toMillis() || start > oneYearFromToday) {
        // start should be between today and one year from today
        _startDateError = strings.INVALID_DATE;
      } else if (end <= start || end > twoMonthsFromStart) {
        // end should be between start and two months from start
        _endDateError = strings.INVALID_DATE;
      }
    }

    if (!requestedSubstratumIds || requestedSubstratumIds?.length === 0) {
      _substratumError = strings.SELECT_AT_LEAST_ONE_SUBSTRATUM;
    }

    const _showSmallSiteWarning =
      selectedSite?.areaHa !== undefined && selectedSite.areaHa < WARN_IF_SITE_LESS_THAN_HECTARES;

    setStartDateError(_startDateError);
    setEndDateError(_endDateError);
    setSubstratumError(_substratumError);
    setShowSmallSiteWarning(_showSmallSiteWarning);

    return _startDateError || _endDateError || _substratumError || _showSmallSiteWarning;
  }, [
    endDate,
    selectedSite?.areaHa,
    requestedSubstratumIds,
    startDate,
    strings.INVALID_DATE,
    strings.REQUIRED_FIELD,
    strings.SELECT_AT_LEAST_ONE_SUBSTRATUM,
  ]);

  const doSave = useCallback(() => {
    if (plantingSite && onReschedule && startDate && endDate) {
      onReschedule({ startDate, endDate });
    }

    if (onSchedule && startDate && endDate && requestedSubstratumIds && selectedSite) {
      onSchedule({ startDate, endDate, requestedSubstratumIds, plantingSiteId: selectedSite.id });
    }

    setShowSmallSiteWarning(false);
  }, [endDate, onReschedule, onSchedule, plantingSite, requestedSubstratumIds, selectedSite, startDate]);

  const onSubmit = useCallback(() => {
    setValidate(true);
    if (!findErrors()) {
      doSave();
    }
  }, [doSave, findErrors, setValidate]);

  const setStartDateCallback = useCallback(
    (value: DateTime<boolean> | undefined) => setStartDate(value?.toISODate() || undefined),
    []
  );
  const setEndDateCallback = useCallback(
    (value: DateTime<boolean> | undefined) => setEndDate(value?.toISODate() || undefined),
    []
  );

  return (
    <TfMain>
      <PageForm
        cancelID={'cancelScheduleObservation'}
        saveID={'scheduleObservation'}
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
                onChange={(value) => setSelectedPlantingSiteId(Number(value))}
                options={siteOptions}
                selectedValue={plantingSite?.id ?? selectedPlantingSiteId}
                disabled={!!plantingSite}
                errorText={validate && !selectedPlantingSiteId ? strings.REQUIRED_FIELD : ''}
                fullWidth
              />
            </Grid>

            {selectedPlantingSiteId && (
              <Grid item xs={12}>
                <ObservationSubstratumSelector
                  errorText={validate ? substratumError : ''}
                  onChangeSelectedSubstrata={setRequestedSubstratumIds}
                  plantingSiteId={selectedPlantingSiteId}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={isMobile ? 12 : 6}>
              <DatePicker
                id='startDate'
                label={strings.OBSERVATION_START_DATE}
                value={startDate ?? ''}
                onDateChange={setStartDateCallback}
                aria-label='date-picker'
                errorText={validate ? startDateError : ''}
              />
            </Grid>

            <Grid item xs={isMobile ? 12 : 6}>
              <DatePicker
                id='endDate'
                label={strings.OBSERVATION_END_DATE}
                value={endDate ?? ''}
                onDateChange={setEndDateCallback}
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
      {showSmallSiteWarning && (
        <SmallSiteWarningDialog onSave={doSave} open={showSmallSiteWarning} setOpen={setShowSmallSiteWarning} />
      )}
    </TfMain>
  );
}
