import { useEffect, useState } from 'react';
import TfMain from 'src/components/common/TfMain';
import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import PageForm from 'src/components/common/PageForm';
import { useDeviceInfo } from '@terraware/web-components/utils';
import useForm from 'src/utils/useForm';
import TrackingService, {
  PlantingSiteId,
  PlantingSitePostRequestBody,
  PlantingSitePutRequestBody,
} from 'src/services/TrackingService';
import { APP_PATHS } from 'src/constants';
import { useHistory, useParams } from 'react-router-dom';
import useSnackbar from 'src/utils/useSnackbar';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { useAppSelector } from 'src/redux/store';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import PageSnackbar from '../PageSnackbar';
import { PlantingSite, UpdatedPlantingSeason } from 'src/types/Tracking';
import BoundariesAndZones from 'src/components/PlantingSites/BoundariesAndZones';
import { useOrganization } from 'src/providers/hooks';
import { TimeZoneDescription } from 'src/types/TimeZones';
import LocationTimeZoneSelector from '../LocationTimeZoneSelector';
import Card from 'src/components/common/Card';
import PlantingSiteMapEditor from 'src/components/Map/PlantingSiteMapEditor';
import { makeStyles } from '@mui/styles';
import { MultiPolygon } from 'geojson';
import PlantingSeasonsEdit from 'src/components/PlantingSites/PlantingSeasonsEdit';

type CreatePlantingSiteProps = {
  reloadPlantingSites: () => void;
};

const useStyles = makeStyles(() => ({
  form: {
    display: 'flex',
    flexGrow: 1,
  },
}));

export default function CreatePlantingSite(props: CreatePlantingSiteProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const classes = useStyles();
  const { reloadPlantingSites } = props;
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const history = useHistory();
  const snackbar = useSnackbar();
  const [nameError, setNameError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const selectedPlantingSite = useAppSelector((state) => selectPlantingSite(state, Number(plantingSiteId)));
  const [effectiveTimeZone, setEffectiveTimeZone] = useState<TimeZoneDescription | undefined>();
  const [plantingSeasonsValid, setPlantingSeasonsValid] = useState(true);
  const [plantingSeasons, setPlantingSeasons] = useState<UpdatedPlantingSeason[]>();
  const [showSaveValidationErrors, setShowSaveValidationErrors] = useState(false);

  const defaultPlantingSite = (): PlantingSite => ({
    id: -1,
    name: '',
    organizationId: selectedOrganization.id,
    plantingSeasons: [],
  });

  const [record, setRecord, onChange] = useForm<PlantingSite>(defaultPlantingSite());

  useEffect(() => {
    setLoaded(true);
  }, [selectedPlantingSite]);

  useEffect(() => {
    setRecord({
      id: selectedPlantingSite?.id || -1,
      name: selectedPlantingSite?.name || '',
      description: selectedPlantingSite?.description,
      boundary: selectedPlantingSite?.boundary,
      plantingZones: selectedPlantingSite?.plantingZones,
      timeZone: selectedPlantingSite?.timeZone,
      organizationId: selectedOrganization.id,
      plantingSeasons: selectedPlantingSite?.plantingSeasons || [],
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

    if (!plantingSeasonsValid) {
      setShowSaveValidationErrors(true);
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
        boundary: record.boundary,
        plantingSeasons,
      };
      response = await TrackingService.createPlantingSite(newPlantingSite);
      id = (response as PlantingSiteId).id;
    } else {
      const updatedPlantingSite: PlantingSitePutRequestBody = {
        name: record.name,
        description: record.description,
        timeZone: record.timeZone,
        boundary: record.boundary,
        plantingSeasons,
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

  const onBoundaryChanged = (newBoundary: MultiPolygon | null) => {
    setRecord((previousRecord: PlantingSite): PlantingSite => {
      return {
        ...previousRecord,
        boundary: (newBoundary as any) || undefined,
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
        className={classes.form}
      >
        <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, paddingRight: 0 }}>
          {loaded && (
            <>
              <Grid
                container
                spacing={3}
                flexGrow={1}
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
                <Card flushMobile style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Grid container display='flex' spacing={3} flexGrow={0}>
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
                        onEffectiveTimeZone={setEffectiveTimeZone}
                        tooltip={strings.TOOLTIP_TIME_ZONE_PLANTING_SITE}
                      />
                    </Grid>
                    {record?.plantingZones && effectiveTimeZone && (
                      <Grid item xs={gridSize()}>
                        <TextField
                          label={strings.UPCOMING_PLANTING_SEASONS}
                          id='upcomingPlantingSeasons'
                          type='text'
                          display={true}
                        />
                        <PlantingSeasonsEdit
                          plantingSeasons={record.plantingSeasons}
                          setPlantingSeasons={setPlantingSeasons}
                          setPlantingSeasonsValid={setPlantingSeasonsValid}
                          setShowSaveValidationErrors={setShowSaveValidationErrors}
                          showSaveValidationErrors={showSaveValidationErrors}
                          timeZone={effectiveTimeZone}
                        />
                      </Grid>
                    )}
                  </Grid>
                  <Grid container flexGrow={1}>
                    <Grid item xs={12} display='flex'>
                      {record?.plantingZones ? (
                        <BoundariesAndZones plantingSite={record} />
                      ) : (
                        <PlantingSiteMapEditor onBoundaryChanged={onBoundaryChanged} plantingSite={record} />
                      )}
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </>
          )}
        </Container>
      </PageForm>
    </TfMain>
  );
}
