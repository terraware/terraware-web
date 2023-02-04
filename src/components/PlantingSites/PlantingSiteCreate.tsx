import TfMain from 'src/components/common/TfMain';
import { Typography, Box, Container, Grid, useTheme } from '@mui/material';
import strings from 'src/strings';
import PageForm from 'src/components/common/PageForm';
import { useDeviceInfo } from '@terraware/web-components/utils';
import useForm from 'src/utils/useForm';
import {
  getPlantingSite,
  PlantingSitePostRequestBody,
  PlantingSitePutRequestBody,
  postPlantingSite,
  updatePlantingSite,
} from 'src/api/tracking/tracking';
import { APP_PATHS } from 'src/constants';
import { useHistory, useParams } from 'react-router-dom';
import useSnackbar from 'src/utils/useSnackbar';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { useEffect, useState } from 'react';
import PageSnackbar from '../PageSnackbar';
import { PlantingSite } from 'src/types/Tracking';
import BoundariesAndPlots from './BoundariesAndPlots';
import { useOrganization } from 'src/providers/hooks';
import { TimeZoneDescription } from 'src/types/TimeZones';
import isEnabled from 'src/features';
import LocationTimeZoneSelector from '../LocationTimeZoneSelector';

type CreatePlantingSiteProps = {
  reloadPlantingSites: () => void;
};

export default function CreatePlantingSite(props: CreatePlantingSiteProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const { reloadPlantingSites } = props;
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const history = useHistory();
  const snackbar = useSnackbar();
  const [nameError, setNameError] = useState('');
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [loaded, setLoaded] = useState(false);
  const timeZoneFeatureEnabled = isEnabled('Timezones');

  const defaultPlantingSite = (): PlantingSite => ({
    id: -1,
    name: '',
  });

  useEffect(() => {
    const fetchPlantingSite = async () => {
      if (plantingSiteId) {
        const serverResponse = await getPlantingSite(Number.parseInt(plantingSiteId, 10));
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
    });
  }, [selectedPlantingSite, setRecord]);

  const goToPlantingSites = () => {
    const plantingSitesLocation = {
      pathname: APP_PATHS.PLANTING_SITES,
    };
    history.push(plantingSitesLocation);
  };

  const savePlantingSite = async () => {
    if (!record.name) {
      setNameError(strings.REQUIRED_FIELD);
      return;
    }

    let response;
    if (record.id === -1) {
      const newPlantingSite: PlantingSitePostRequestBody = {
        name: record.name,
        description: record.description,
        organizationId: selectedOrganization.id,
        timeZone: record.timeZone,
      };
      response = await postPlantingSite(newPlantingSite);
    } else {
      const updatedPlantingSite: PlantingSitePutRequestBody = {
        name: record.name,
        description: record.description,
        timeZone: record.timeZone,
      };
      response = await updatePlantingSite(record.id, updatedPlantingSite);
    }

    if (response.requestSucceeded) {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      reloadPlantingSites();
      goToPlantingSites();
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
    return 6;
  };

  return (
    <TfMain>
      <PageForm
        cancelID='cancelCreatePlantingSite'
        saveID='saveCreatePlantingSite'
        onCancel={goToPlantingSites}
        onSave={savePlantingSite}
      >
        <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
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
                <Box
                  sx={{
                    backgroundColor: theme.palette.TwClrBg,
                    borderRadius: '32px',
                    padding: theme.spacing(3),
                  }}
                >
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
                  </Grid>
                  {timeZoneFeatureEnabled && (
                    <Grid item xs={gridSize()} marginTop={3}>
                      <LocationTimeZoneSelector location={record} onChangeTimeZone={onChangeTimeZone} />
                    </Grid>
                  )}
                </Box>
              </Grid>
              {record?.boundary && <BoundariesAndPlots plantingSite={record} />}
            </>
          )}
        </Container>
      </PageForm>
    </TfMain>
  );
}
