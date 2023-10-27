import { Box, Grid, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import _ from 'lodash';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import TextField from '../common/Textfield/Textfield';
import useForm from 'src/utils/useForm';
import PageForm from '../common/PageForm';
import { getAllSeedBanks } from 'src/utils/organization';
import { Facility } from 'src/types/Facility';
import { FacilityService, SeedBankService, SubLocationService } from 'src/services';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageSnackbar from 'src/components/PageSnackbar';
import useSnackbar from 'src/utils/useSnackbar';
import TfMain from 'src/components/common/TfMain';
import { useOrganization } from 'src/providers/hooks';
import { TimeZoneDescription } from 'src/types/TimeZones';
import LocationTimeZoneSelector from '../LocationTimeZoneSelector';
import { PartialSubLocation } from 'src/types/Facility';
import SubLocations from 'src/components/SeedBank/SubLocations';
import { DatePicker } from '@terraware/web-components';

export default function SeedBankView(): JSX.Element {
  const { selectedOrganization, reloadOrganizations } = useOrganization();
  const theme = useTheme();
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [validateDates, setValidateDates] = useState(false);
  const [editedSubLocations, setEditedSubLocations] = useState<PartialSubLocation[]>();
  const snackbar = useSnackbar();

  const [record, setRecord, onChange] = useForm<Facility>({
    name: '',
    id: -1,
    type: 'Seed Bank',
    organizationId: selectedOrganization.id,
    connectionState: 'Not Connected',
  });
  const { seedBankId } = useParams<{ seedBankId: string }>();
  const [selectedSeedBank, setSelectedSeedBank] = useState<Facility | null>();
  const history = useHistory();
  const { isMobile } = useDeviceInfo();
  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  useEffect(() => {
    const seedBanks = getAllSeedBanks(selectedOrganization);
    setSelectedSeedBank(seedBanks?.find((sb) => sb?.id === parseInt(seedBankId, 10)));
  }, [seedBankId, selectedOrganization]);

  useEffect(() => {
    setRecord({
      name: selectedSeedBank?.name || '',
      description: selectedSeedBank?.description,
      id: selectedSeedBank?.id ?? -1,
      organizationId: selectedOrganization.id,
      type: 'Seed Bank',
      connectionState: 'Not Connected',
      timeZone: selectedSeedBank?.timeZone,
      buildStartedDate: selectedSeedBank?.buildStartedDate,
      buildCompletedDate: selectedSeedBank?.buildCompletedDate,
      operationStartedDate: selectedSeedBank?.operationStartedDate,
    });
  }, [selectedSeedBank, setRecord, selectedOrganization]);

  const goToSeedBank = (id?: number) => {
    const sitesLocation = {
      pathname: APP_PATHS.SEED_BANKS + (id ? `/${id}` : ''),
    };
    history.push(sitesLocation);
  };

  const saveSubLocations = async (facilityId: number) => {
    if (!editedSubLocations) {
      return;
    }

    const isEqual = (location1: PartialSubLocation, location2: PartialSubLocation) => {
      return location1.id === location2.id;
    };

    const isModified = (location1: PartialSubLocation, location2: PartialSubLocation) => {
      return location1.id === location2.id && location1.name !== location2.name;
    };

    /**
     * Find existing locations and pick out the ones to delete, create and update.
     * Use bulk API to delete, create, update.
     */
    const response = await SeedBankService.getSubLocations(facilityId);
    if (response.requestSucceeded) {
      const { subLocations } = response;
      const toDelete = _.differenceWith(subLocations, editedSubLocations, isEqual);
      const toCreate = _.differenceWith(editedSubLocations, subLocations, isEqual);
      const toUpdate = _.intersectionWith(editedSubLocations, subLocations, isModified);

      const promises = [];
      if (toDelete.length) {
        promises.push(
          SubLocationService.deleteSubLocations(
            facilityId,
            toDelete.map((l) => l.id)
          )
        );
      }
      if (toUpdate.length) {
        promises.push(SubLocationService.updateSubLocations(facilityId, toUpdate as { name: string; id: number }[]));
      }
      if (toCreate.length) {
        promises.push(
          SeedBankService.createSubLocations(
            facilityId,
            toCreate.map((l) => l.name as string)
          )
        );
      }

      await Promise.allSettled(promises);
    } else {
      snackbar.toastError();
    }
  };

  const saveSeedBank = async () => {
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
        await saveSubLocations(selectedSeedBank.id as number);
        await reloadOrganizations(selectedOrganization.id);
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
        await reloadOrganizations(selectedOrganization.id);
        snackbar.toastSuccess(strings.SEED_BANK_ADDED);
        id = response.facilityId || undefined;
      } else {
        snackbar.toastError();
      }
    }
    goToSeedBank(id);
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
        onSave={saveSeedBank}
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
                onChange={(value) => onChange('name', value)}
                value={record.name}
                errorText={record.name ? '' : nameError}
              />
            </Grid>
            <Grid item xs={gridSize()}>
              <TextField
                id='description'
                label={strings.DESCRIPTION_REQUIRED}
                type='textarea'
                onChange={(value) => onChange('description', value)}
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
          <SubLocations
            seedBankId={selectedSeedBank?.id === -1 ? undefined : selectedSeedBank?.id}
            onEdit={(locations) => setEditedSubLocations(locations)}
          />
        </Box>
      </PageForm>
    </TfMain>
  );
}
