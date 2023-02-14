import { Box, Grid, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
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
import isEnabled from 'src/features';
import LocationTimeZoneSelector from '../LocationTimeZoneSelector';

export default function NurseryView(): JSX.Element {
  const { selectedOrganization, reloadOrganizations } = useOrganization();
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const snackbar = useSnackbar();
  const theme = useTheme();
  const timeZoneFeatureEnabled = isEnabled('Timezones');

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
    return 6;
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
    });
  }, [selectedNursery, setRecord, selectedOrganization]);

  const goToNurseries = () => {
    const nurseriesLocation = {
      pathname: APP_PATHS.NURSERIES,
    };
    history.push(nurseriesLocation);
  };

  const saveNursery = async () => {
    if (!record.name) {
      setNameError(strings.REQUIRED_FIELD);
      return;
    }
    if (!record.description) {
      setDescriptionError(strings.REQUIRED_FIELD);
      return;
    }
    const response = selectedNursery
      ? await FacilityService.updateFacility({ ...record } as Facility)
      : await FacilityService.createFacility(record);

    if (response.requestSucceeded) {
      reloadOrganizations();
      snackbar.toastSuccess(selectedNursery ? strings.CHANGES_SAVED : strings.NURSERY_ADDED);
      goToNurseries();
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

  return (
    <TfMain>
      <PageForm cancelID='cancelCreateNursery' saveID='saveCreateNursery' onCancel={goToNurseries} onSave={saveNursery}>
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
            {timeZoneFeatureEnabled && (
              <Grid item xs={gridSize()}>
                <LocationTimeZoneSelector
                  location={record}
                  onChangeTimeZone={onChangeTimeZone}
                  tooltip={strings.TOOLTIP_TIME_ZONE_NURSERY}
                />
              </Grid>
            )}
          </Grid>
        </Box>
      </PageForm>
    </TfMain>
  );
}
