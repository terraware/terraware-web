import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

import { Box, Divider, Grid, Typography, useTheme } from '@mui/material';
import { Button, DialogBox, Dropdown, DropdownItem } from '@terraware/web-components';
import { DateTime } from 'luxon';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import DatePicker from 'src/components/common/DatePicker';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { useFeatureEnabled } from 'src/features';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useLocalization } from 'src/providers';
import { ScheduleObservationRequestPayload } from 'src/queries/generated/observations';
import SmallSiteWarningDialog from 'src/scenes/ObservationsRouterV2/Schedule/SmallSiteWarningDialog';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import MonitoringTypeSelector from './MonitoringTypeSelector';
import ObservationSubstratumSelector from './ObservationSubstratumSelector';
import getObservationDateErrors from './getObservationDateErrors';
import { MONITORING_TYPES, MonitoringType } from './monitoringTypes';
import useObservablePlantingSites from './useObservablePlantingSites';

const WARN_IF_SITE_LESS_THAN_HECTARES = 3.0;

export type ScheduleObservationContext = {
  defaultTypeChanged: boolean;
  includesSurveyedStrata: boolean;
  siteHasPlantings: boolean;
};

export type ScheduleObservationFormProps = {
  title: string;
  onCancel: () => void;
  onSchedule: (formData: ScheduleObservationRequestPayload, context: ScheduleObservationContext) => void;
};

export default function ScheduleObservationForm({
  title,
  onCancel,
  onSchedule,
}: ScheduleObservationFormProps): JSX.Element {
  const { activeLocale, strings } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const biomassSchedulingEnabled = useFeatureEnabled('Scheduled Biomass Monitoring Observations');
  const baselineSurveyEnabled = useFeatureEnabled('Baseline Survey');

  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number>();
  const { plantingSite: selectedSiteDetails } = usePlantingSite(selectedPlantingSiteId);

  const observableSites = useObservablePlantingSites();
  const [searchParams] = useSearchParams();
  const requestedPlantingSiteId = Number(searchParams.get('plantingSiteId'));

  const todayISO = useMemo(() => DateTime.now().startOf('day').toISODate(), []);

  const selectedSite = useMemo(
    () => observableSites.find((site) => site.id === selectedPlantingSiteId),
    [observableSites, selectedPlantingSiteId]
  );

  useEffect(() => {
    if (selectedPlantingSiteId !== undefined) {
      return;
    }
    if (observableSites.length === 1) {
      setSelectedPlantingSiteId(observableSites[0].id);
    } else if (observableSites.some((site) => site.id === requestedPlantingSiteId)) {
      setSelectedPlantingSiteId(requestedPlantingSiteId);
    }
  }, [observableSites, requestedPlantingSiteId, selectedPlantingSiteId]);

  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [requestedSubstratumIds, setRequestedSubstratumIds] = useState<number[]>();
  const [monitoringType, setMonitoringType] = useState<MonitoringType>('Monitoring');

  const upcomingObservationStartDates = useMemo(
    () => selectedSite?.upcomingObservationStartDates ?? {},
    [selectedSite?.upcomingObservationStartDates]
  );
  const hasPlantings = selectedSite?.hasPlantings === true;

  const showMonitoringTypeSelector = biomassSchedulingEnabled && !!selectedPlantingSiteId;
  const selectedMonitoringTypeUnavailable =
    showMonitoringTypeSelector &&
    !(baselineSurveyEnabled && monitoringType === 'Baseline Survey') &&
    (!hasPlantings || upcomingObservationStartDates[monitoringType] !== undefined);

  const defaultMonitoringType = useRef<MonitoringType>('Monitoring');

  useEffect(() => {
    if (monitoringType === 'Baseline Survey' || upcomingObservationStartDates[monitoringType] === undefined) {
      return;
    }
    const schedulableType = MONITORING_TYPES.find((type) => upcomingObservationStartDates[type] === undefined);
    if (schedulableType) {
      defaultMonitoringType.current = schedulableType;
      setMonitoringType(schedulableType);
    }
  }, [monitoringType, upcomingObservationStartDates]);

  const [validate, setValidate] = useState<boolean>(false);
  const [startDateError, setStartDateError] = useState<string>();
  const [endDateError, setEndDateError] = useState<string>();
  const [substratumError, setSubstratumError] = useState<string>();
  const [showSmallSiteWarning, setShowSmallSiteWarning] = useState<boolean>();
  const [showBaselineWarning, setShowBaselineWarning] = useState(false);

  const baselineOverlaps = useMemo(
    () =>
      monitoringType === 'Baseline Survey'
        ? (selectedSiteDetails?.strata
            ?.flatMap((stratum) => stratum.substrata)
            .filter(
              (substratum) => requestedSubstratumIds?.includes(substratum.id) && substratum.latestBaselineSurveyStatus
            ) ?? [])
        : [],
    [monitoringType, requestedSubstratumIds, selectedSiteDetails]
  );

  const includesSurveyedStrata = useMemo(
    () =>
      selectedSiteDetails?.strata?.some((stratum) =>
        stratum.substrata.some(
          (substratum) =>
            requestedSubstratumIds?.includes(substratum.id) && substratum.latestBaselineSurveyStatus === 'Completed'
        )
      ) ?? false,
    [requestedSubstratumIds, selectedSiteDetails]
  );

  const siteOptions = useMemo(
    (): DropdownItem[] =>
      observableSites
        .toSorted((a, b) => a.name.localeCompare(b.name, activeLocale || undefined))
        .map((site) => ({
          label: site.name,
          value: site.id,
        })),
    [activeLocale, observableSites]
  );

  const selectedSiteAreaHa = selectedSite?.areaHa;

  const findErrors = useCallback(() => {
    const { startDateError: _startDateError = '', endDateError: _endDateError = '' } = getObservationDateErrors(
      startDate,
      endDate
    );
    let _substratumError: string = '';

    setStartDateError(_startDateError);
    setEndDateError(_endDateError);

    if (!requestedSubstratumIds || requestedSubstratumIds?.length === 0) {
      _substratumError = strings.SELECT_AT_LEAST_ONE_SUBSTRATUM;
    }

    setSubstratumError(_substratumError);
    return _startDateError || _endDateError || _substratumError;
  }, [startDate, endDate, strings.SELECT_AT_LEAST_ONE_SUBSTRATUM, requestedSubstratumIds]);

  const doSave = useCallback(() => {
    if (startDate && endDate && requestedSubstratumIds && selectedSite) {
      onSchedule(
        {
          startDate,
          endDate,
          requestedSubstratumIds,
          plantingSiteId: selectedSite.id,
          observationType: biomassSchedulingEnabled ? monitoringType : undefined,
        },
        {
          defaultTypeChanged: monitoringType !== defaultMonitoringType.current,
          includesSurveyedStrata,
          siteHasPlantings: hasPlantings,
        }
      );
    }

    setShowSmallSiteWarning(false);
    setShowBaselineWarning(false);
  }, [
    biomassSchedulingEnabled,
    endDate,
    hasPlantings,
    includesSurveyedStrata,
    monitoringType,
    onSchedule,
    requestedSubstratumIds,
    selectedSite,
    startDate,
  ]);

  const saveWithBaselineWarning = useCallback(() => {
    setShowSmallSiteWarning(false);
    if (baselineOverlaps.length > 0) {
      setShowBaselineWarning(true);
    } else {
      doSave();
    }
  }, [baselineOverlaps, doSave]);

  const closeBaselineWarning = useCallback(() => setShowBaselineWarning(false), []);

  const onSubmit = useCallback(() => {
    setValidate(true);
    if (!findErrors()) {
      if (selectedSiteAreaHa !== undefined && selectedSiteAreaHa < WARN_IF_SITE_LESS_THAN_HECTARES) {
        setShowSmallSiteWarning(true);
      } else {
        saveWithBaselineWarning();
      }
    }
  }, [findErrors, saveWithBaselineWarning, selectedSiteAreaHa]);

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
        saveDisabled={selectedMonitoringTypeUnavailable}
      >
        <Box marginBottom={theme.spacing(4)} paddingLeft={theme.spacing(3)}>
          <Typography fontSize='24px' fontWeight={600}>
            {title}
          </Typography>
          <PageSnackbar />
        </Box>

        <Card style={{ maxWidth: '568px', margin: 'auto' }}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Dropdown
                id='site'
                label={strings.PLANTING_SITE}
                onChange={(value) => setSelectedPlantingSiteId(Number(value))}
                options={siteOptions}
                selectedValue={selectedPlantingSiteId}
                errorText={validate && !selectedPlantingSiteId ? strings.REQUIRED_FIELD : ''}
                fullWidth
              />
            </Grid>

            {showMonitoringTypeSelector && (
              <Grid size={12} paddingTop={0}>
                <MonitoringTypeSelector
                  hasPlantings={hasPlantings}
                  onChange={setMonitoringType}
                  selectedMonitoringType={monitoringType}
                  upcomingObservationStartDates={upcomingObservationStartDates}
                />
              </Grid>
            )}

            {!selectedMonitoringTypeUnavailable && (
              <>
                {selectedPlantingSiteId && (
                  <Grid size={12}>
                    <ObservationSubstratumSelector
                      errorText={validate ? substratumError : ''}
                      monitoringType={monitoringType}
                      onChangeSelectedSubstrata={setRequestedSubstratumIds}
                      plantingSiteId={selectedPlantingSiteId}
                      preselectBaselineSubstrata
                    />
                  </Grid>
                )}

                <Grid size={12}>
                  <Divider />
                </Grid>

                <Grid size={isMobile ? 12 : 6}>
                  <DatePicker
                    id='startDate'
                    label={strings.OBSERVATION_START_DATE}
                    value={startDate ?? ''}
                    onDateChange={setStartDateCallback}
                    aria-label='date-picker'
                    errorText={validate ? startDateError : ''}
                    minDate={todayISO}
                  />
                </Grid>

                <Grid size={isMobile ? 12 : 6}>
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
              </>
            )}
          </Grid>
        </Card>
      </PageForm>
      {showSmallSiteWarning && (
        <SmallSiteWarningDialog
          onSave={saveWithBaselineWarning}
          open={showSmallSiteWarning}
          setOpen={setShowSmallSiteWarning}
        />
      )}
      {showBaselineWarning && (
        <DialogBox
          open={true}
          onClose={closeBaselineWarning}
          title={strings.SOME_SUBSTRATA_ALREADY_HAVE_A_BASELINE}
          size='medium'
          skrim={true}
          middleButtons={[
            <Button
              key='go-back'
              label={strings.GO_BACK}
              priority='secondary'
              type='passive'
              onClick={closeBaselineWarning}
            />,
            <Button key='schedule-anyway' label={strings.SCHEDULE_ANYWAY} onClick={doSave} />,
          ]}
        >
          <Typography textAlign='left'>
            {strings.THESE_SUBSTRATA_ARE_ALREADY_INCLUDED_IN_A_COMPLETED_OR_SCHEDULED_BASELINE_SURVEY}
          </Typography>
          <Box component='ul' textAlign='left'>
            {baselineOverlaps.map((substratum) => (
              <Typography component='li' key={substratum.id}>
                {strings.formatString(
                  substratum.latestBaselineSurveyStatus === 'Overdue'
                    ? strings.X_OVERDUE_Y
                    : ['Completed', 'Abandoned'].includes(substratum.latestBaselineSurveyStatus!)
                      ? strings.X_COMPLETED_Y
                      : strings.X_SCHEDULED_Y,
                  substratum.fullName,
                  substratum.latestBaselineSurveyDate ?? ''
                )}
              </Typography>
            ))}
          </Box>
          <Typography textAlign='left'>{strings.DO_YOU_WANT_TO_SCHEDULE_ANOTHER_BASELINE_FOR_THEM}</Typography>
        </DialogBox>
      )}
    </TfMain>
  );
}
