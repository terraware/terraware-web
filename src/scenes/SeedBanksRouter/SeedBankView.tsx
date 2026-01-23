import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import PageSnackbar from 'src/components/PageSnackbar';
import DatePicker from 'src/components/common/DatePicker';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import SeedBankSubLocations from 'src/scenes/SeedBanksRouter/SeedBankSubLocations';
import { FacilityService, SubLocationService } from 'src/services';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import { PartialSubLocation } from 'src/types/Facility';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { getAllSeedBanks } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import LocationTimeZoneSelector from '../../components/LocationTimeZoneSelector';
import PageForm from '../../components/common/PageForm';
import TextField from '../../components/common/Textfield/Textfield';

export type NavigateToFacilityObject = {
  navigate: boolean;
  id?: number;
};

export default function SeedBankView(): JSX.Element {
  const { selectedOrganization, reloadOrganizations } = useOrganization();
  const theme = useTheme();
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [validateDates, setValidateDates] = useState(false);
  const [editedSubLocations, setEditedSubLocations] = useState<PartialSubLocation[]>();
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
  const [selectedSeedBank, setSelectedSeedBank] = useState<Facility | null>();
  const navigate = useSyncNavigate();
  const { isMobile } = useDeviceInfo();
  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

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

  useEffect(() => {
    if (seedBankId) {
      const seedBanks = selectedOrganization ? getAllSeedBanks(selectedOrganization) : [];
      setSelectedSeedBank(seedBanks?.find((sb) => sb?.id === parseInt(seedBankId, 10)));
    }
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
    if (selectedSeedBank) {
      const response = await FacilityService.updateFacility({ ...record } as Facility);
      if (response.requestSucceeded) {
        if (editedSubLocations) {
          await SubLocationService.saveEditedSubLocations(selectedSeedBank.id, editedSubLocations);
        }
        void reloadOrganizations(selectedOrganization?.id);
        snackbar.toastSuccess(strings.CHANGES_SAVED);
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
      } else {
        snackbar.toastError();
      }
    }
    setNavigateToSeedBank({ navigate: true, id });
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

  return (
    <TfMain>
      <PageForm
        cancelID='cancelCreateSeedBank'
        saveID='saveCreateSeedBank'
        onCancel={() => goToSeedBank(selectedSeedBank?.id)}
        onSave={() => void saveSeedBank()}
      >
        <Box marginBottom={theme.spacing(4)} paddingLeft={theme.spacing(3)}>
          <Typography fontSize='24px' fontWeight={600}>
            {selectedSeedBank ? selectedSeedBank?.name : strings.ADD_SEED_BANK}
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
                tooltip={strings.TOOLTIP_TIME_ZONE_SEEDBANK}
              />
            </Grid>
            <Grid item xs={gridSize()}>
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
            <Grid item xs={gridSize()}>
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
            <Grid item xs={gridSize()}>
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
          />
        </Box>
      </PageForm>
    </TfMain>
  );
}
