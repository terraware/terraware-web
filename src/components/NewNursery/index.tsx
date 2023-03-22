import { Box, Grid, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import TextField from '../common/Textfield/Textfield';
import useForm from 'src/utils/useForm';
import PageForm from '../common/PageForm';
import { Facility } from 'src/types/Facility';
import { FacilityService } from 'src/services';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageSnackbar from 'src/components/PageSnackbar';
import useSnackbar from 'src/utils/useSnackbar';
import { getAllNurseries } from 'src/utils/organization';
import TfMain from 'src/components/common/TfMain';
import { useOrganization } from 'src/providers/hooks';
import { TimeZoneDescription } from 'src/types/TimeZones';
import LocationTimeZoneSelector from '../LocationTimeZoneSelector';
import { CreateFacilityResponse } from 'src/services/FacilityService';
import { DatePicker } from '@terraware/web-components';

export default function NurseryView(): JSX.Element {
  const { selectedOrganization, reloadOrganizations } = useOrganization();
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [validateDates, setValidateDates] = useState(false);
  const snackbar = useSnackbar();
  const theme = useTheme();

  const [record, setRecord, onChange] = useForm<Facility>({
    name: '',
    id: -1,
    type: 'Nursery',
    organizationId: selectedOrganization.id,
    connectionState: 'Not Connected',
  });
  const { nurseryId } = useParams<{ nurseryId: string }>();
  const [selectedNursery, setSelectedNursery] = useState<Facility | null>();
  const history = useHistory();
  const { isMobile } = useDeviceInfo();
  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  useEffect(() => {
    const seedBanks = getAllNurseries(selectedOrganization);
    setSelectedNursery(seedBanks?.find((sb) => sb?.id === parseInt(nurseryId, 10)));
  }, [nurseryId, selectedOrganization]);

  useEffect(() => {
    setRecord({
      name: selectedNursery?.name || '',
      description: selectedNursery?.description,
      id: selectedNursery?.id ?? -1,
      organizationId: selectedOrganization.id,
      type: 'Nursery',
      connectionState: 'Not Connected',
      timeZone: selectedNursery?.timeZone,
      buildStartedDate: selectedNursery?.buildStartedDate,
      buildCompletedDate: selectedNursery?.buildCompletedDate,
      operationStartedDate: selectedNursery?.operationStartedDate,
    });
  }, [selectedNursery, setRecord, selectedOrganization]);

  const goToNursery = (id?: number) => {
    const nurseriesLocation = {
      pathname: APP_PATHS.NURSERIES + (id ? `/${id}` : ''),
    };
    history.push(nurseriesLocation);
  };

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
      : await FacilityService.createFacility(record);

    if (response.requestSucceeded) {
      await reloadOrganizations(selectedOrganization.id);
      snackbar.toastSuccess(selectedNursery ? strings.CHANGES_SAVED : strings.NURSERY_ADDED);
      if (!selectedNursery) {
        id = (response as CreateFacilityResponse).facilityId || undefined;
      }
      goToNursery(id);
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
        cancelID='cancelCreateNursery'
        saveID='saveCreateNursery'
        onCancel={() => goToNursery(selectedNursery?.id)}
        onSave={saveNursery}
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
                tooltip={strings.TOOLTIP_TIME_ZONE_NURSERY}
              />
            </Grid>
            <Grid item xs={gridSize()}>
              <DatePicker
                id={'buildStartedDate'}
                label={strings.REPORT_NURSERY_BUILD_START_DATE}
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
                label={strings.REPORT_NURSERY_BUILD_COMPLETION_DATE}
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
                label={strings.REPORT_NURSERY_OPERATION_START_DATE}
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
        </Box>
      </PageForm>
    </TfMain>
  );
}
