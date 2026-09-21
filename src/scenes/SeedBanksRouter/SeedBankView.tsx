import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button } from '@terraware/web-components';

import LocationTimeZoneSelector from 'src/components/LocationTimeZoneSelector';
import Page from 'src/components/Page';
import DatePicker from 'src/components/common/DatePicker';
import TextField from 'src/components/common/Textfield/Textfield';
import UnsavedChangesBadge from 'src/components/common/UnsavedChangesBadge';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import SeedBankSubLocations from 'src/scenes/SeedBanksRouter/SeedBankSubLocations';
import { FacilityService, SubLocationService } from 'src/services';
import strings from 'src/strings';
import { Facility, PartialSubLocation } from 'src/types/Facility';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { getAllSeedBanks } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

export type NavigateToFacilityObject = {
  navigate: boolean;
  id?: number;
};

const getComparableFacility = (facility?: Facility): string =>
  JSON.stringify({
    buildCompletedDate: facility?.buildCompletedDate ?? null,
    buildStartedDate: facility?.buildStartedDate ?? null,
    description: facility?.description ?? '',
    name: facility?.name ?? '',
    operationStartedDate: facility?.operationStartedDate ?? null,
    timeZone: facility?.timeZone ?? null,
  });

const normalizeSubLocations = (locations?: PartialSubLocation[]): string =>
  JSON.stringify((locations ?? []).map(({ id, name }) => ({ id, name })).sort((a, b) => (a.id ?? 0) - (b.id ?? 0)));

export default function SeedBankView(): JSX.Element {
  const { selectedOrganization, reloadOrganizations } = useOrganization();
  const theme = useTheme();
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [validateDates, setValidateDates] = useState(false);
  const [editedSubLocations, setEditedSubLocations] = useState<PartialSubLocation[]>();
  const [baselineSubLocations, setBaselineSubLocations] = useState<PartialSubLocation[]>();
  const [saving, setSaving] = useState(false);
  const snackbar = useSnackbar();
  const [navigateToSeedBank, setNavigateToSeedBank] = useState<NavigateToFacilityObject>({
    navigate: false,
    id: undefined,
  });

  const [record, setRecord, , onChangeCallback] = useForm<Facility>({
    name: '',
    id: -1,
    type: 'Seed Bank',
    organizationId: selectedOrganization?.id || -1,
    connectionState: 'Not Connected',
  });
  const { seedBankId } = useParams<{ seedBankId: string }>();
  const navigate = useSyncNavigate();
  const { isMobile } = useDeviceInfo();
  const gridSize = isMobile ? 12 : 4;

  const goToSeedBank = useCallback(
    (id?: number) => {
      const sitesLocation = {
        pathname: APP_PATHS.SEED_BANKS + (id ? `/${id}` : ''),
      };
      navigate(sitesLocation);
    },
    [navigate]
  );

  useEffect(() => {
    if (navigateToSeedBank.navigate) {
      goToSeedBank(navigateToSeedBank.id);
    }
  }, [goToSeedBank, navigateToSeedBank, selectedOrganization]);

  const selectedSeedBank = useMemo<Facility | undefined>(() => {
    if (seedBankId) {
      const seedBanks = selectedOrganization ? getAllSeedBanks(selectedOrganization) : [];
      return seedBanks?.find((sb) => sb?.id === parseInt(seedBankId, 10));
    }
    return undefined;
  }, [seedBankId, selectedOrganization]);

  useEffect(() => {
    setRecord({
      name: selectedSeedBank?.name || '',
      description: selectedSeedBank?.description,
      id: selectedSeedBank?.id ?? -1,
      organizationId: selectedOrganization?.id || -1,
      type: 'Seed Bank',
      connectionState: 'Not Connected',
      timeZone: selectedSeedBank?.timeZone,
      buildStartedDate: selectedSeedBank?.buildStartedDate,
      buildCompletedDate: selectedSeedBank?.buildCompletedDate,
      operationStartedDate: selectedSeedBank?.operationStartedDate,
    });
  }, [selectedSeedBank, setRecord, selectedOrganization]);

  const onLoadSubLocations = useCallback((locations: PartialSubLocation[]) => setBaselineSubLocations(locations), []);

  const isDirty = useMemo(() => {
    const facilityDirty = getComparableFacility(record) !== getComparableFacility(selectedSeedBank);
    const subLocationsDirty =
      editedSubLocations !== undefined &&
      normalizeSubLocations(editedSubLocations) !== normalizeSubLocations(baselineSubLocations);
    return facilityDirty || subLocationsDirty;
  }, [record, selectedSeedBank, editedSubLocations, baselineSubLocations]);

  const saveSeedBank = async () => {
    if (!selectedOrganization) {
      return;
    }
    let id = selectedSeedBank?.id;
    if (
      !record.name ||
      !record.description ||
      !FacilityService.facilityBuildStartedDateValid(
        record.buildStartedDate,
        record.buildCompletedDate,
        record.operationStartedDate
      ) ||
      !FacilityService.facilityBuildCompletedDateValid(
        record.buildStartedDate,
        record.buildCompletedDate,
        record.operationStartedDate
      ) ||
      !FacilityService.facilityOperationStartedDateValid(
        record.buildStartedDate,
        record.buildCompletedDate,
        record.operationStartedDate
      )
    ) {
      setNameError(!record.name ? strings.REQUIRED_FIELD : '');
      setDescriptionError(!record.description ? strings.REQUIRED_FIELD : '');
      setValidateDates(true);
      return;
    }

    setSaving(true);
    let succeeded = false;
    try {
      if (selectedSeedBank) {
        const response = await FacilityService.updateFacility({ ...record } as Facility);
        if (response.requestSucceeded) {
          if (editedSubLocations) {
            await SubLocationService.saveEditedSubLocations(selectedSeedBank.id, editedSubLocations);
          }
          void reloadOrganizations(selectedOrganization?.id);
          snackbar.toastSuccess(strings.CHANGES_SAVED);
          succeeded = true;
        } else {
          snackbar.toastError();
        }
      } else {
        const response = await FacilityService.createFacility({
          ...record,
          subLocationNames: editedSubLocations?.map((l) => l.name as string),
        });
        if (response.requestSucceeded) {
          await reloadOrganizations(selectedOrganization?.id);
          snackbar.toastSuccess(strings.SEED_BANK_ADDED);
          id = response.facilityId || undefined;
          succeeded = true;
        } else {
          snackbar.toastError();
        }
      }
    } finally {
      setSaving(false);
    }

    if (succeeded) {
      setNavigateToSeedBank({ navigate: true, id });
    }
  };

  const onChangeTimeZone = (newTimeZone: TimeZoneDescription | undefined) => {
    setRecord((previousRecord: Facility): Facility => {
      return {
        ...previousRecord,
        timeZone: newTimeZone ? newTimeZone.id : undefined,
      };
    });
  };

  const onUpdateDate = (field: string, value: any) => {
    setRecord((previousRecord: Facility): Facility => {
      return {
        ...previousRecord,
        [field]: value,
      };
    });
  };

  const title = (
    <Box
      alignItems='center'
      display='flex'
      flexWrap='wrap'
      gap={theme.spacing(1.5)}
      sx={{ paddingLeft: theme.spacing(3) }}
    >
      <Typography fontSize='24px' fontWeight={600}>
        {selectedSeedBank ? selectedSeedBank?.name : strings.ADD_SEED_BANK}
      </Typography>
      {isDirty && <UnsavedChangesBadge />}
    </Box>
  );

  const rightComponent = (
    <Box alignItems='center' display='flex' gap={theme.spacing(1)} justifyContent='flex-end'>
      <Button
        disabled={saving}
        id='cancelCreateSeedBank'
        label={strings.CANCEL}
        onClick={() => goToSeedBank(selectedSeedBank?.id)}
        priority='secondary'
        size='medium'
        type='passive'
      />
      <Button
        disabled={!isDirty || saving}
        id='saveCreateSeedBank'
        label={strings.SAVE}
        onClick={() => void saveSeedBank()}
        size='medium'
      />
    </Box>
  );

  return (
    <Page rightComponent={rightComponent} stickyHeader stickyHeaderElevated={isDirty} title={title}>
      {saving && <BusySpinner withSkrim={true} />}
      <Box
        sx={{
          backgroundColor: theme.palette.TwClrBg,
          borderRadius: '32px',
          padding: theme.spacing(3),
          width: '100%',
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={gridSize}>
            <TextField
              id='name'
              label={strings.NAME_REQUIRED}
              type='text'
              onChange={onChangeCallback('name')}
              value={record.name}
              errorText={record.name ? '' : nameError}
            />
          </Grid>
          <Grid item xs={gridSize}>
            <TextField
              id='description'
              label={strings.DESCRIPTION_REQUIRED}
              type='textarea'
              onChange={onChangeCallback('description')}
              value={record.description}
              errorText={record.description ? '' : descriptionError}
            />
          </Grid>
          <Grid item xs={gridSize}>
            <LocationTimeZoneSelector
              location={record}
              onChangeTimeZone={onChangeTimeZone}
              tooltip={strings.TOOLTIP_TIME_ZONE_SEEDBANK}
            />
          </Grid>
          <Grid item xs={gridSize}>
            <DatePicker
              id={'buildStartedDate'}
              label={strings.FACILITY_BUILD_START_DATE}
              value={record.buildStartedDate ?? ''}
              onChange={(value) => onUpdateDate('buildStartedDate', value)}
              aria-label='date-picker'
              errorText={
                validateDates &&
                !FacilityService.facilityBuildStartedDateValid(
                  record.buildStartedDate,
                  record.buildCompletedDate,
                  record.operationStartedDate
                )
                  ? strings.FACILITY_BUILD_START_DATE_INVALID
                  : ''
              }
              maxDate={record.buildCompletedDate}
            />
          </Grid>
          <Grid item xs={gridSize}>
            <DatePicker
              id={'buildCompletedDate'}
              label={strings.FACILITY_BUILD_COMPLETION_DATE}
              value={record.buildCompletedDate ?? ''}
              onChange={(value) => onUpdateDate('buildCompletedDate', value)}
              aria-label='date-picker'
              errorText={
                validateDates &&
                !FacilityService.facilityBuildCompletedDateValid(
                  record.buildStartedDate,
                  record.buildCompletedDate,
                  record.operationStartedDate
                )
                  ? strings.FACILITY_BUILD_COMPLETION_DATE_INVALID
                  : ''
              }
              minDate={record.buildStartedDate}
              maxDate={record.operationStartedDate}
            />
          </Grid>
          <Grid item xs={gridSize}>
            <DatePicker
              id={'operationStartedDate'}
              label={strings.FACILITY_OPERATION_START_DATE}
              value={record.operationStartedDate ?? ''}
              onChange={(value) => onUpdateDate('operationStartedDate', value)}
              aria-label='date-picker'
              errorText={
                validateDates &&
                !FacilityService.facilityOperationStartedDateValid(
                  record.buildStartedDate,
                  record.buildCompletedDate,
                  record.operationStartedDate
                )
                  ? strings.FACILITY_OPERATION_START_DATE_INVALID
                  : ''
              }
              minDate={record.buildCompletedDate}
            />
          </Grid>
        </Grid>
        <SeedBankSubLocations
          seedBankId={selectedSeedBank?.id === -1 ? undefined : selectedSeedBank?.id}
          onEdit={(locations) => setEditedSubLocations(locations)}
          onLoad={onLoadSubLocations}
        />
      </Box>
    </Page>
  );
}
