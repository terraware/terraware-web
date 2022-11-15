import { ServerOrganization } from 'src/types/Organization';
import TfMain from 'src/components/common/TfMain';
import { Typography, Container, Grid } from '@mui/material';
import { Icon, theme } from '@terraware/web-components';
import strings from 'src/strings';
import FormBottomBar from '../common/FormBottomBar';
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
import { Link, useHistory, useParams } from 'react-router-dom';
import useSnackbar from 'src/utils/useSnackbar';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { useEffect, useState } from 'react';
import PageSnackbar from '../PageSnackbar';
import { makeStyles } from '@mui/styles';
import { PlantingSite } from 'src/api/types/tracking';
import BoundariesAndPlots from './BoundariesAndPlots';

type CreatePlantingSiteProps = {
  organization: ServerOrganization;
};

const useStyles = makeStyles(() => ({
  backIcon: {
    fill: theme.palette.TwClrIcnBrand,
    marginRight: theme.spacing(1),
  },
  back: {
    display: 'flex',
    textDecoration: 'none',
    color: theme.palette.TwClrTxtBrand,
    fontSize: '20px',
    alignItems: 'center',
  },
}));

export default function CreatePlantingSite(props: CreatePlantingSiteProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const { organization } = props;
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const history = useHistory();
  const snackbar = useSnackbar();
  const [nameError, setNameError] = useState('');
  const classes = useStyles();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();

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
        }
      }
    };

    fetchPlantingSite();
  }, [plantingSiteId, organization]);
  const [record, setRecord, onChange] = useForm<PlantingSite>(defaultPlantingSite());

  useEffect(() => {
    setRecord({
      id: selectedPlantingSite?.id || -1,
      name: selectedPlantingSite?.name || '',
      description: selectedPlantingSite?.description,
      boundary: selectedPlantingSite?.boundary,
      plantingZones: selectedPlantingSite?.plantingZones,
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
        organizationId: organization.id,
      };
      response = await postPlantingSite(newPlantingSite);
    } else {
      const updatedPlantingSite: PlantingSitePutRequestBody = {
        name: record.name,
        description: record.description,
      };
      response = await updatePlantingSite(record.id, updatedPlantingSite);
    }

    if (response.requestSucceeded) {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      goToPlantingSites();
    } else {
      snackbar.toastError();
    }
  };

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  return (
    <TfMain>
      <Container maxWidth={false}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Link id='back' to={APP_PATHS.PLANTING_SITES} className={classes.back}>
              <Icon name='caretLeft' className={classes.backIcon} />
              {strings.PLANTING_SITES}
            </Link>
          </Grid>
          <Grid item xs={12}>
            <Typography fontSize={selectedPlantingSite ? '20px' : '24px'} fontWeight={600} margin={theme.spacing(1, 0)}>
              {record.id !== -1 && selectedPlantingSite ? selectedPlantingSite.name : strings.ADD_PLANTING_SITE}
            </Typography>
            {record.id === -1 && (
              <Typography fontSize='14px' fontWeight={400} margin={theme.spacing(0, 0, 3, 0)}>
                {strings.ADD_PLANTING_SITE_DESCRIPTION}
              </Typography>
            )}
          </Grid>
          <PageSnackbar />
          <Grid item xs={gridSize()}>
            <TextField
              id='name'
              label={strings.NAME_REQUIRED}
              type='text'
              onChange={onChange}
              value={record.name}
              errorText={record.name ? '' : nameError}
            />
          </Grid>
          <Grid item xs={gridSize()}>
            <TextField
              id='description'
              label={strings.DESCRIPTION}
              type='textarea'
              onChange={onChange}
              value={record.description}
            />
          </Grid>
          <BoundariesAndPlots plantingSite={selectedPlantingSite || record} />
        </Grid>
      </Container>
      <FormBottomBar onCancel={goToPlantingSites} onSave={savePlantingSite} />
    </TfMain>
  );
}
