import { ServerOrganization } from 'src/types/Organization';
import TfMain from 'src/components/common/TfMain';
import { Typography, Container, Grid, Box } from '@mui/material';
import { Button, Icon, theme } from '@terraware/web-components';
import strings from 'src/strings';
import FormBottomBar from '../common/FormBottomBar';
import { useDeviceInfo } from '@terraware/web-components/utils';
import useForm from 'src/utils/useForm';
import { PlantingSitePostRequestBody, postPlantingSite } from 'src/api/tracking/tracking';
import { APP_PATHS } from 'src/constants';
import { Link, useHistory } from 'react-router-dom';
import useSnackbar from 'src/utils/useSnackbar';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { useState } from 'react';
import PageSnackbar from '../PageSnackbar';
import { makeStyles } from '@mui/styles';

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
  const history = useHistory();
  const snackbar = useSnackbar();
  const [nameError, setNameError] = useState('');
  const classes = useStyles();

  const defaultPlantingSite = (): PlantingSitePostRequestBody => ({
    name: '',
    organizationId: organization.id,
  });

  const [record, , onChange] = useForm<PlantingSitePostRequestBody>(defaultPlantingSite());

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
    const response = await postPlantingSite(record);

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
            <Typography fontSize='24px' fontWeight={600} margin={theme.spacing(1, 0)}>
              {strings.ADD_PLANTING_SITE}
            </Typography>
            <Typography fontSize='14px' fontWeight={400} margin={theme.spacing(0, 0, 3, 0)}>
              {strings.ADD_PLANTING_SITE_DESCRIPTION}
            </Typography>
          </Grid>
          <PageSnackbar />
          <Grid item xs={gridSize()}>
            <TextField
              id='name'
              label={strings.NAME}
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

          <Grid item xs={12}>
            <Typography fontSize='20px' fontWeight={600} margin={theme.spacing(3, 0)}>
              {strings.BOUNDARIES_AND_PLOTS}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                border: '1px solid #A9B7B8',
                maxWidth: '800px',
                margin: '0 auto',
                textAlign: 'center',
                paddingX: 5,
              }}
            >
              <Typography fontSize='20px' fontWeight={600} margin={theme.spacing(3, 0)}>
                {strings.IMPORT_BOUNDARIES_AND_PLOTS}
              </Typography>
              <Typography fontSize='16px' fontWeight={400} padding={theme.spacing(1, 0)}>
                {strings.IMPORT_BOUNDARIES_AND_PLOTS_DESCRIPTION}
              </Typography>
              <Box sx={{ paddingY: 2 }}>
                <Button label={strings.CONTACT_US} onClick={() => true} size='medium' />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <FormBottomBar onCancel={goToPlantingSites} onSave={savePlantingSite} />
    </TfMain>
  );
}
