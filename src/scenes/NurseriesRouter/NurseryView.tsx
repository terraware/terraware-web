import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import PageSnackbar from 'src/components/PageSnackbar';
import DatePicker from 'src/components/common/DatePicker';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import NurserySubLocations from 'src/scenes/NurseriesRouter/NurserySubLocations';
import { FacilityService, SubLocationService } from 'src/services';
import { CreateFacilityResponse } from 'src/services/FacilityService';
import strings from 'src/strings';
import { Facility, PartialSubLocation } from 'src/types/Facility';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { getAllNurseries } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

import LocationTimeZoneSelector from '../../components/LocationTimeZoneSelector';
import PageForm from '../../components/common/PageForm';
import TextField from '../../components/common/Textfield/Textfield';
import { NavigateToFacilityObject } from '../SeedBanksRouter/SeedBankView';

export default function NurseryView(): JSX.Element {
  const { selectedOrganization, reloadOrganizations } = useOrganization();
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [validateDates, setValidateDates] = useState(false);
  const [editedSubLocations, setEditedSubLocations] = useState<PartialSubLocation[]>();
  const snackbar = useSnackbar();
  const theme = useTheme();
  const [navigateToNursery, setNavigateToNursery] = useState<NavigateToFacilityObject>({
    navigate: false,
    id: undefined,
  });

  const [record, setRecord, , onChangeCallback] = useForm<Facility>({
    name: '',
    id: -1,
    type: 'Nursery',
    organizationId: selectedOrganization?.id || -1,
    connectionState: 'Not Connected',
  });
  const { nurseryId } = useParams<{ nurseryId: string }>();
  const [selectedNursery, setSelectedNursery] = useState<Facility | null>();
  const navigate = useSyncNavigate();
  const { isMobile } = useDeviceInfo();
  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };
  const timeZoneId = useLocationTimeZone().get(record)?.id;

  useEffect(() => {
    if (nurseryId) {
      const seedBanks = selectedOrganization ? getAllNurseries(selectedOrganization) : [];
      setSelectedNursery(seedBanks?.find((sb) => sb?.id === parseInt(nurseryId, 10)));
    }
  }, [nurseryId, selectedOrganization]);

  const goToNursery = useCallback(
    (id?: number) => {
      const nurseriesLocation = {
        pathname: APP_PATHS.NURSERIES + (id ? `/${id}` : ''),
      };
      navigate(nurseriesLocation);
    },
    [navigate]
  );

  useEffect(() => {
    if (navigateToNursery.navigate) {
      goToNursery(navigateToNursery.id);
    }
  }, [selectedOrganization, goToNursery, navigateToNursery.id, navigateToNursery.navigate]);

  useEffect(() => {
    setRecord({
      name: selectedNursery?.name || '',
      description: selectedNursery?.description,
      id: selectedNursery?.id ?? -1,
      organizationId: selectedOrganization?.id || -1,
      type: 'Nursery',
      connectionState: 'Not Connected',
      timeZone: selectedNursery?.timeZone,
      buildStartedDate: selectedNursery?.buildStartedDate,
      buildCompletedDate: selectedNursery?.buildCompletedDate,
      operationStartedDate: selectedNursery?.operationStartedDate,
      capacity: selectedNursery?.capacity,
    });
  }, [selectedNursery, setRecord, selectedOrganization]);

  const saveNursery = async () => {
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
    let id = selectedNursery?.id;
    const response = selectedNursery
      ? await FacilityService.updateFacility({ ...record } as Facility)
      : await FacilityService.createFacility({
          ...record,
          subLocationNames: editedSubLocations?.map((l) => l.name as string),
        });

    if (response.requestSucceeded && selectedOrganization) {
      if (selectedNursery && editedSubLocations) {
        await SubLocationService.saveEditedSubLocations(id as number, editedSubLocations);
      }
      void reloadOrganizations(selectedOrganization.id);
      snackbar.toastSuccess(selectedNursery ? strings.CHANGES_SAVED : strings.NURSERY_ADDED);
      if (!selectedNursery) {
        id = (response as CreateFacilityResponse).facilityId || undefined;
      }
      setNavigateToNursery({ navigate: true, id });
    } else {
      snackbar.toastError();
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

  const onUpdateDate = (field: string, value?: Date | null) => {
    setRecord((previousRecord: Facility): Facility => {
      return {
        ...previousRecord,
        [field]: value ? getDateDisplayValue(value, timeZoneId) : value,
      };
    });
  };

  const onUpdateCapacity = (value: number) => {
    setRecord((previousRecord: Facility): Facility => {
      return {
        ...previousRecord,
        capacity: value,
      };
    });
  };

  return (
    <TfMain>
      <PageForm
        cancelID='cancelCreateNursery'
        saveID='saveCreateNursery'
        onCancel={() => goToNursery(selectedNursery?.id)}
        onSave={() => void saveNursery()}
      >
        <Box marginBottom={theme.spacing(4)} paddingLeft={theme.spacing(3)}>
          <Typography fontSize='24px' fontWeight={600}>
            {selectedNursery ? selectedNursery.name : strings.ADD_NURSERY}
          </Typography>
          <PageSnackbar />
        </Box>
        <Box
          sx={{
            backgroundColor: theme.palette.TwClrBg,
            borderRadius: '32px',
            padding: theme.spacing(3),
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={gridSize()}>
              <TextField
                id='name'
                label={strings.NAME_REQUIRED}
                type='text'
                onChange={onChangeCallback('name')}
                value={record.name}
                errorText={record.name ? '' : nameError}
              />
            </Grid>
            <Grid item xs={gridSize()}>
              <TextField
                id='description'
                label={strings.DESCRIPTION_REQUIRED}
                type='textarea'
                onChange={onChangeCallback('description')}
                value={record.description}
                errorText={record.description ? '' : descriptionError}
              />
            </Grid>
            <Grid item xs={gridSize()}>
              <LocationTimeZoneSelector
                location={record}
                onChangeTimeZone={onChangeTimeZone}
                tooltip={strings.TOOLTIP_TIME_ZONE_NURSERY}
              />
            </Grid>
            <Grid item xs={gridSize()}>
              <DatePicker
                aria-label='date-picker'
                defaultTimeZone={timeZoneId}
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
                id={'buildStartedDate'}
                label={strings.FACILITY_BUILD_START_DATE}
                maxDate={record.buildCompletedDate}
                onChange={(value?: Date | null) => onUpdateDate('buildStartedDate', value)}
                value={record.buildStartedDate ?? ''}
              />
            </Grid>
            <Grid item xs={gridSize()}>
              <DatePicker
                aria-label='date-picker'
                defaultTimeZone={timeZoneId}
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
                id={'buildCompletedDate'}
                label={strings.FACILITY_BUILD_COMPLETION_DATE}
                maxDate={record.operationStartedDate}
                minDate={record.buildStartedDate}
                onChange={(value?: Date | null) => onUpdateDate('buildCompletedDate', value)}
                value={record.buildCompletedDate ?? ''}
              />
            </Grid>
            <Grid item xs={gridSize()}>
              <DatePicker
                aria-label='date-picker'
                defaultTimeZone={timeZoneId}
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
                id={'operationStartedDate'}
                label={strings.FACILITY_OPERATION_START_DATE}
                minDate={record.buildCompletedDate}
                onChange={(value?: Date | null) => onUpdateDate('operationStartedDate', value)}
                value={record.operationStartedDate ?? ''}
              />
            </Grid>
            <Grid item xs={gridSize()}>
              <TextField
                id={'capacity'}
                label={strings.NURSERY_CAPACITY}
                value={record.capacity ?? ''}
                onChange={(value) => onUpdateCapacity(value as number)}
                type='number'
                min={0}
                aria-label='date-picker'
              />
            </Grid>
          </Grid>
          <NurserySubLocations
            nurseryId={selectedNursery?.id}
            onEdit={(subLocations: PartialSubLocation[]) => setEditedSubLocations(subLocations)}
          />
        </Box>
      </PageForm>
    </TfMain>
  );
}
