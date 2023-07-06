import TfMain from 'src/components/common/TfMain';
import { Typography, Box, Container, Grid, useTheme } from '@mui/material';
import strings from 'src/strings';
import PageForm from 'src/components/common/PageForm';
import { useDeviceInfo } from '@terraware/web-components/utils';
import useForm from 'src/utils/useForm';
import TrackingService, { PlantingSitePostRequestBody, PlantingSitePutRequestBody } from 'src/services/TrackingService';
import { APP_PATHS } from 'src/constants';
import { useHistory, useParams } from 'react-router-dom';
import useSnackbar from 'src/utils/useSnackbar';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { useEffect, useState } from 'react';
import PageSnackbar from '../PageSnackbar';
import { PlantingSite } from 'src/types/Tracking';
import BoundariesAndZones from 'src/components/PlantingSites/BoundariesAndZones';
import { useOrganization } from 'src/providers/hooks';
import { TimeZoneDescription } from 'src/types/TimeZones';
import LocationTimeZoneSelector from '../LocationTimeZoneSelector';
import { PlantingSiteId } from 'src/services/TrackingService';
import Card from 'src/components/common/Card';
import isEnabled from 'src/features';
import { getMonth } from 'src/utils/dateFormatter';
import { useLocalization } from 'src/providers';

type CreatePlantingSiteProps = {
  reloadPlantingSites: () => void;
};

export default function CreatePlantingSite(props: CreatePlantingSiteProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const { reloadPlantingSites } = props;
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const history = useHistory();
  const snackbar = useSnackbar();
  const [nameError, setNameError] = useState('');
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [loaded, setLoaded] = useState(false);
  const trackingV2 = isEnabled('TrackingV2');

  const defaultPlantingSite = (): PlantingSite => ({
    id: -1,
    name: '',
    organizationId: selectedOrganization.id,
  });

  useEffect(() => {
    const fetchPlantingSite = async () => {
      if (plantingSiteId) {
        const serverResponse = await TrackingService.getPlantingSite(Number.parseInt(plantingSiteId, 10));
        if (serverResponse.requestSucceeded) {
          setSelectedPlantingSite(serverResponse.site);
          setLoaded(true);
        }
      } else {
        setLoaded(true);
      }
    };

    fetchPlantingSite();
  }, [plantingSiteId, selectedOrganization]);
  const [record, setRecord, onChange] = useForm<PlantingSite>(defaultPlantingSite());

  useEffect(() => {
    setRecord({
      id: selectedPlantingSite?.id || -1,
      name: selectedPlantingSite?.name || '',
      description: selectedPlantingSite?.description,
      boundary: selectedPlantingSite?.boundary,
      plantingZones: selectedPlantingSite?.plantingZones,
      timeZone: selectedPlantingSite?.timeZone,
      organizationId: selectedOrganization.id,
    });
  }, [selectedPlantingSite, setRecord, selectedOrganization.id]);

  const goToPlantingSite = (id?: number) => {
    const plantingSitesLocation = {
      pathname: APP_PATHS.PLANTING_SITES + (id && id !== -1 ? `/${id}` : ''),
    };
    history.push(plantingSitesLocation);
  };

  const savePlantingSite = async () => {
    if (!record.name) {
      setNameError(strings.REQUIRED_FIELD);
      return;
    }

    let response;
    let id = record.id;
    if (record.id === -1) {
      const newPlantingSite: PlantingSitePostRequestBody = {
        name: record.name,
        description: record.description,
        organizationId: record.organizationId,
        timeZone: record.timeZone,
      };
      response = await TrackingService.createPlantingSite(newPlantingSite);
      id = (response as PlantingSiteId).id;
    } else {
      const updatedPlantingSite: PlantingSitePutRequestBody = {
        name: record.name,
        description: record.description,
        timeZone: record.timeZone,
      };
      response = await TrackingService.updatePlantingSite(record.id, updatedPlantingSite);
    }

    if (response.requestSucceeded) {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      reloadPlantingSites();
      goToPlantingSite(id);
    } else {
      snackbar.toastError();
    }
  };

  const onChangeTimeZone = (newTimeZone: TimeZoneDescription | undefined) => {
    setRecord((previousRecord: PlantingSite): PlantingSite => {
      return {
        ...previousRecord,
        timeZone: newTimeZone ? newTimeZone.id : undefined,
      };
    });
  };

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  return (
    <TfMain>
      <PageForm
        cancelID='cancelCreatePlantingSite'
        saveID='saveCreatePlantingSite'
        onCancel={() => goToPlantingSite(record.id)}
        onSave={savePlantingSite}
      >
        <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, paddingRight: 0 }}>
          {loaded && (
            <>
              <Grid
                container
                spacing={3}
                flexGrow={0}
                display='flex'
                flexDirection='column'
                marginTop={theme.spacing(3)}
              >
                <Box
                  paddingLeft={theme.spacing(3)}
                  marginBottom={theme.spacing(4)}
                  display='flex'
                  flexDirection='column'
                >
                  <Typography
                    fontSize={selectedPlantingSite ? '20px' : '24px'}
                    fontWeight={600}
                    margin={theme.spacing(1, 0)}
                  >
                    {record.id !== -1 && selectedPlantingSite ? selectedPlantingSite.name : strings.ADD_PLANTING_SITE}
                  </Typography>
                </Box>
                <PageSnackbar />
                <Card flushMobile>
                  <Grid container spacing={3} flexGrow={0}>
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
                        label={strings.DESCRIPTION}
                        type='textarea'
                        onChange={(value) => onChange('description', value)}
                        value={record.description}
                      />
                    </Grid>
                    <Grid item xs={gridSize()}>
                      <LocationTimeZoneSelector
                        location={record}
                        onChangeTimeZone={onChangeTimeZone}
                        tooltip={strings.TOOLTIP_TIME_ZONE_PLANTING_SITE}
                      />
                    </Grid>
                    {trackingV2 && selectedPlantingSite && (
                      <>
                        <Grid item xs={gridSize()} marginTop={isMobile ? 1 : 0}>
                          <TextField
                            label={strings.PLANTING_SEASON_START}
                            id='planting-season-start'
                            type='text'
                            value={getMonth(selectedPlantingSite?.plantingSeasonStartMonth, activeLocale)}
                            display={true}
                          />
                        </Grid>
                        <Grid item xs={gridSize()}>
                          <TextField
                            label={strings.PLANTING_SEASON_END}
                            id='planting-season-end'
                            type='text'
                            value={getMonth(selectedPlantingSite?.plantingSeasonEndMonth, activeLocale)}
                            display={true}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                  {record?.boundary && (
                    <Grid item xs={12}>
                      <BoundariesAndZones plantingSite={record} />
                    </Grid>
                  )}
                </Card>
              </Grid>
            </>
          )}
        </Container>
      </PageForm>
    </TfMain>
  );
}
