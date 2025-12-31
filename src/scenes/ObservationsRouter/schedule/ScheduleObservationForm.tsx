import React, { useCallback, useMemo, useState } from 'react';

import { Box, Divider, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';
import { DateTime } from 'luxon';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import DatePicker from 'src/components/common/DatePicker';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { useOrgTracking } from 'src/hooks/useOrgTracking';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import SmallSiteWarningDialog from 'src/scenes/ObservationsRouter/schedule/SmallSiteWarningDialog';
import strings from 'src/strings';
import { ScheduleObservationRequestPayload } from 'src/types/Observations';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ObservationSubstratumSelector from './ObservationSubstratumSelector';

const WARN_IF_SITE_LESS_THAN_HECTARES = 3.0;

export type ScheduleObservationFormProps = {
  title: string;
  onCancel: () => void;
  onSave: (formData: ScheduleObservationRequestPayload) => void;

  // If planting sites are not selectable, props for displaying the planting stie
  plantingSiteId?: number;
  disablePlantingSiteSelect?: boolean;

  // Hide subzone selections
  disablePlantingSubzoneSelect?: boolean;
};

export default function ScheduleObservationForm({
  title,
  onCancel,
  onSave,
}: ScheduleObservationFormProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const { observations, reportedPlants } = useOrgTracking();
  const { allPlantingSites, plantingSite, setSelectedPlantingSite } = usePlantingSiteData();

  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [requestedSubzoneIds, setRequestedSubzoneIds] = useState<number[]>();

  const [validate, setValidate] = useState<boolean>(false);
  const [startDateError, setStartDateError] = useState<string>();
  const [endDateError, setEndDateError] = useState<string>();
  const [subzoneError, setSubzoneError] = useState<string>();
  const [showSmallSiteWarning, setShowSmallSiteWarning] = useState<boolean>();

  const upcomingObservations = useMemo(() => {
    const now = Date.now();
    return observations?.filter((observation) => {
      const endTime = new Date(observation.endDate).getTime();
      return observation.state === 'Upcoming' && now <= endTime;
    });
  }, [observations]);

  const plantingSitesWithZonesAndNoUpcomingObservations = useMemo(() => {
    if (!allPlantingSites || !reportedPlants) {
      return [];
    }
    return allPlantingSites?.filter((site) => {
      if (!site.strata?.length) {
        return false;
      }
      const sitePlants = reportedPlants.find((_sitePlants) => _sitePlants.id === site.id);
      if (!sitePlants?.totalPlants) {
        return false;
      }
      const siteUpcomingObservations = upcomingObservations?.filter(
        (observation) => observation.plantingSiteId === site.id
      );
      if (siteUpcomingObservations.length > 0) {
        return false;
      }
      return true;
    });
  }, [allPlantingSites, reportedPlants, upcomingObservations]);

  const siteOptions = useMemo((): DropdownItem[] => {
    return plantingSitesWithZonesAndNoUpcomingObservations
      .toSorted((a, b) => a.name.localeCompare(b.name, activeLocale || undefined))
      .map((site) => ({
        label: site.name,
        value: site.id,
      }));
  }, [activeLocale, plantingSitesWithZonesAndNoUpcomingObservations]);

  const findErrors = useCallback(() => {
    let _startDateError: string = '';
    let _endDateError: string = '';
    let _subzoneError: string = '';
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

    if (!requestedSubzoneIds || requestedSubzoneIds?.length === 0) {
      _subzoneError = strings.SELECT_AT_LEAST_ONE_SUBZONE;
    }

    const _showSmallSiteWarning =
      plantingSite?.areaHa !== undefined && plantingSite.areaHa < WARN_IF_SITE_LESS_THAN_HECTARES;

    setStartDateError(_startDateError);
    setEndDateError(_endDateError);
    setSubzoneError(_subzoneError);
    setShowSmallSiteWarning(_showSmallSiteWarning);

    return _startDateError || _endDateError || _subzoneError || _showSmallSiteWarning;
  }, [endDate, plantingSite, requestedSubzoneIds, setShowSmallSiteWarning, startDate]);

  const onSelectPlantingSite = useCallback(
    (value: string) => {
      setSelectedPlantingSite(Number(value));
    },
    [setSelectedPlantingSite]
  );

  const doSave = useCallback(() => {
    if (startDate && endDate && requestedSubzoneIds && plantingSite) {
      onSave({ startDate, endDate, requestedSubstratumIds: requestedSubzoneIds, plantingSiteId: plantingSite.id });
    }
  }, [endDate, onSave, plantingSite, requestedSubzoneIds, startDate]);

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
                onChange={onSelectPlantingSite}
                options={siteOptions}
                selectedValue={plantingSite?.id}
                errorText={validate && !plantingSite?.id ? strings.REQUIRED_FIELD : ''}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <ObservationSubstratumSelector
                errorText={validate ? subzoneError : ''}
                onChangeSelectedSubzones={setRequestedSubzoneIds}
              />
            </Grid>

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
