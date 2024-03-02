import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { MultiPolygon } from 'geojson';

import PlantingSiteMapEditor from 'src/components/Map/PlantingSiteMapEditor';
import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import { View } from 'src/components/common/ListMapSelector';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers/hooks';
import { searchPlantingSiteZones } from 'src/redux/features/observations/plantingSiteDetailsSelectors';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import BoundariesAndZones from 'src/scenes/PlantingSitesRouter/view/BoundariesAndZones';
import TrackingService, {
  PlantingSiteId,
  PlantingSitePostRequestBody,
  PlantingSitePutRequestBody,
} from 'src/services/TrackingService';
import strings from 'src/strings';
import { PlantingSite, UpdatedPlantingSeason } from 'src/types/Tracking';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import DetailsInputForm from './DetailsInputForm';

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
  const theme = useTheme();
  const classes = useStyles();
  const { reloadPlantingSites } = props;
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const history = useHistory();
  const snackbar = useSnackbar();
  const [loaded, setLoaded] = useState(false);
  const [onValidate, setOnValidate] = useState<((hasErrors: boolean) => void) | undefined>(undefined);
  const [plantingSeasons, setPlantingSeasons] = useState<UpdatedPlantingSeason[]>();
  const [view, setView] = useState<View>('map');
  const [search, setSearch] = useState<string>('');
  const selectedPlantingSite = useAppSelector((state) => selectPlantingSite(state, Number(plantingSiteId)));
  const data = useAppSelector((state) =>
    searchPlantingSiteZones(state, Number(plantingSiteId), view === 'map' ? '' : search.trim())
  );

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
      boundary: selectedPlantingSite?.boundary,
      description: selectedPlantingSite?.description,
      id: selectedPlantingSite?.id || -1,
      name: selectedPlantingSite?.name || '',
      organizationId: selectedOrganization.id,
      plantingSeasons: selectedPlantingSite?.plantingSeasons || [],
      plantingZones: selectedPlantingSite?.plantingZones,
      projectId: selectedPlantingSite?.projectId,
      timeZone: selectedPlantingSite?.timeZone,
    });
  }, [selectedPlantingSite, setRecord, selectedOrganization.id]);

  const goToPlantingSite = (id?: number) => {
    const plantingSitesLocation = {
      pathname: APP_PATHS.PLANTING_SITES + (id && id !== -1 ? `/${id}` : ''),
    };
    history.push(plantingSitesLocation);
  };

  const onSave = () =>
    new Promise((resolve) => {
      setOnValidate(() => async (hasErrors: boolean) => {
        if (hasErrors) {
          setOnValidate(undefined);
          resolve(false);
          return;
        }
        const saved = await savePlantingSite();
        if (!saved) {
          setOnValidate(undefined);
          resolve(false);
        }
      });
    });

  const savePlantingSite = async (): Promise<boolean> => {
    let response;
    let id = record.id;
    if (record.id === -1) {
      const newPlantingSite: PlantingSitePostRequestBody = {
        boundary: record.boundary,
        description: record.description,
        name: record.name,
        organizationId: record.organizationId,
        plantingSeasons,
        projectId: record.projectId,
        timeZone: record.timeZone,
      };
      response = await TrackingService.createPlantingSite(newPlantingSite);
      id = (response as PlantingSiteId).id;
    } else {
      const updatedPlantingSite: PlantingSitePutRequestBody = {
        boundary: record.boundary,
        description: record.description,
        name: record.name,
        plantingSeasons,
        projectId: record.projectId,
        timeZone: record.timeZone,
      };
      response = await TrackingService.updatePlantingSite(record.id, updatedPlantingSite);
    }

    if (response.requestSucceeded) {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      reloadPlantingSites();
      goToPlantingSite(id);
      return true;
    } else {
      snackbar.toastError();
      return false;
    }
  };

  const onBoundaryChanged = (newBoundary: MultiPolygon | null) => {
    setRecord((previousRecord: PlantingSite): PlantingSite => {
      return {
        ...previousRecord,
        boundary: (newBoundary as any) || undefined,
      };
    });
  };

  return (
    <TfMain>
      <PageForm
        cancelID='cancelCreatePlantingSite'
        saveID='saveCreatePlantingSite'
        onCancel={() => goToPlantingSite(record.id)}
        onSave={onSave}
        className={classes.form}
      >
        <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, paddingRight: 0 }}>
          {loaded && (
            <>
              <Grid
                spacing={3}
                flexGrow={view === 'list' ? 0 : 1}
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
                  <DetailsInputForm<PlantingSite>
                    onChange={onChange}
                    onValidate={onValidate}
                    plantingSeasons={plantingSeasons}
                    record={record}
                    setPlantingSeasons={setPlantingSeasons}
                    setRecord={setRecord}
                  />
                  {record?.plantingZones && (
                    <BoundariesAndZones
                      data={data}
                      plantingSite={record}
                      search={search}
                      setSearch={setSearch}
                      setView={setView}
                      view={view}
                      zoneViewUrl={APP_PATHS.PLANTING_SITES_ZONE_VIEW}
                    />
                  )}
                  {!record?.plantingZones && (
                    <Grid container flexGrow={1}>
                      <Grid item xs={12} display='flex'>
                        <PlantingSiteMapEditor onBoundaryChanged={onBoundaryChanged} plantingSite={record} />
                      </Grid>
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
