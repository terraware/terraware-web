import { Box, Grid, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import TextField from '../common/Textfield/Textfield';
import useForm from 'src/utils/useForm';
import PageForm from '../common/PageForm';
import { getAllSeedBanks } from 'src/utils/organization';
import { Facility } from 'src/types/Facility';
import { FacilityService } from 'src/services';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageSnackbar from 'src/components/PageSnackbar';
import useSnackbar from 'src/utils/useSnackbar';
import TfMain from 'src/components/common/TfMain';
import { useOrganization } from 'src/providers/hooks';
import { TimeZoneDescription } from 'src/types/TimeZones';
import isEnabled from 'src/features';
import LocationTimeZoneSelector from '../LocationTimeZoneSelector';
import StorageLocations from 'src/components/SeedBank/StorageLocations';

export default function SeedBankView(): JSX.Element {
  const { selectedOrganization, reloadOrganizations } = useOrganization();
  const theme = useTheme();
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const snackbar = useSnackbar();
  const timeZoneFeatureEnabled = isEnabled('Timezones');

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
    return 6;
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
    });
  }, [selectedSeedBank, setRecord, selectedOrganization]);

  const goToSeedBanks = () => {
    const sitesLocation = {
      pathname: APP_PATHS.SEED_BANKS,
    };
    history.push(sitesLocation);
  };

  const saveSeedBank = async () => {
    if (!record.name) {
      setNameError(strings.REQUIRED_FIELD);
      return;
    }
    if (!record.description) {
      setDescriptionError(strings.REQUIRED_FIELD);
      return;
    }
    if (selectedSeedBank) {
      const response = await FacilityService.updateFacility({ ...record } as Facility);
      if (response.requestSucceeded) {
        reloadOrganizations();
        snackbar.toastSuccess(strings.CHANGES_SAVED);
      } else {
        snackbar.toastError();
      }
    } else {
      const response = await FacilityService.createFacility(record);
      if (response.requestSucceeded) {
        reloadOrganizations();
        snackbar.toastSuccess(strings.SEED_BANK_ADDED);
      } else {
        snackbar.toastError();
      }
    }
    goToSeedBanks();
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
      <PageForm
        cancelID='cancelCreateSeedBank'
        saveID='saveCreateSeedBank'
        onCancel={goToSeedBanks}
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
            {timeZoneFeatureEnabled && (
              <Grid item xs={gridSize()}>
                <LocationTimeZoneSelector
                  location={record}
                  onChangeTimeZone={onChangeTimeZone}
                  tooltip={strings.TOOLTIP_TIME_ZONE_SEEDBANK}
                />
              </Grid>
            )}
          </Grid>
          <StorageLocations
            seedBankId={selectedSeedBank?.id === -1 ? undefined : selectedSeedBank?.id}
            onEdit={(locations) => console.log('WUT', locations)}
          />
        </Box>
      </PageForm>
    </TfMain>
  );
}
