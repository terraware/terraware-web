import TfMain from 'src/components/common/TfMain';
import { Typography, Container, Grid, Theme, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';
import strings from 'src/strings';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { getPlantingSite } from 'src/api/tracking/tracking';
import { APP_PATHS } from 'src/constants';
import { Link, useHistory, useParams } from 'react-router-dom';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { useEffect, useState } from 'react';
import PageSnackbar from '../PageSnackbar';
import { makeStyles } from '@mui/styles';
import { PlantingSite } from 'src/api/types/tracking';
import BoundariesAndPlots from './BoundariesAndPlots';

const useStyles = makeStyles((theme: Theme) => ({
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

export default function PlantingSiteView(): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles();
  const theme = useTheme();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const [plantingSite, setPlantingSite] = useState<PlantingSite>();
  const history = useHistory();

  useEffect(() => {
    const loadPlantingSite = async () => {
      const response = await getPlantingSite(Number.parseInt(plantingSiteId, 10));
      if (response.requestSucceeded) {
        setPlantingSite(response.site);
      }
    };

    loadPlantingSite();
  }, [plantingSiteId]);

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  const goToEditPlantingSite = () => {
    const editPlantingSiteLocation = {
      pathname: APP_PATHS.PLANTING_SITES_EDIT.replace(':plantingSiteId', plantingSiteId),
    };
    history.push(editPlantingSiteLocation);
  };

  return (
    <TfMain>
      <Container maxWidth={false} sx={{ display: 'flex', flexDirection: plantingSite?.boundary ? 'row' : 'column' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Link id='back' to={APP_PATHS.PLANTING_SITES} className={classes.back}>
              <Icon name='caretLeft' className={classes.backIcon} />
              {strings.PLANTING_SITES}
            </Link>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography fontSize='20px' fontWeight={600} margin={theme.spacing(1, 0)}>
              {plantingSite?.name}
            </Typography>
            {isMobile ? (
              <Button icon='iconEdit' onClick={goToEditPlantingSite} priority='secondary' />
            ) : (
              <Button icon='iconEdit' label={strings.EDIT} onClick={goToEditPlantingSite} priority='secondary' />
            )}
          </Grid>
          <PageSnackbar />
          <Grid item xs={gridSize()}>
            <TextField id='name' label={strings.NAME} type='text' value={plantingSite?.name} display={true} />
          </Grid>
          <Grid item xs={gridSize()}>
            <TextField
              id='description'
              label={strings.DESCRIPTION}
              type='textarea'
              value={plantingSite?.description}
              display={true}
            />
          </Grid>
          {plantingSite && <BoundariesAndPlots plantingSite={plantingSite} />}
        </Grid>
      </Container>
    </TfMain>
  );
}
