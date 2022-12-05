import TfMain from 'src/components/common/TfMain';
import { Typography, Grid, Theme, useTheme } from '@mui/material';
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
    fontSize: '14px',
    alignItems: 'center',
  },
  titleWithButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
      <Grid container padding={theme.spacing(0, 0, 4, 0)}>
        <Grid item xs={12} marginBottom={theme.spacing(3)}>
          <Link id='back' to={APP_PATHS.PLANTING_SITES} className={classes.back}>
            <Icon name='caretLeft' className={classes.backIcon} size='small' />
            <Typography fontSize='14px' fontWeight={500}>
              {strings.PLANTING_SITES}
            </Typography>
          </Link>
        </Grid>
        <Grid item xs={12} padding={theme.spacing(0, 3)} className={classes.titleWithButton}>
          <Typography fontSize='20px' fontWeight={600}>
            {plantingSite?.name}
          </Typography>
          <Button
            icon='iconEdit'
            label={isMobile ? undefined : strings.EDIT_PLANTING_SITE}
            priority='primary'
            size='medium'
            onClick={goToEditPlantingSite}
          />
        </Grid>
        <Grid item xs={12}>
          <PageSnackbar />
        </Grid>
      </Grid>

      <Grid
        container
        sx={{
          backgroundColor: theme.palette.TwClrBg,
          borderRadius: '32px',
          padding: theme.spacing(3),
          margin: 0,
        }}
      >
        <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
          <TextField label={strings.NAME} id='name' type='text' value={plantingSite?.name} display={true} />
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField
            label={strings.DESCRIPTION}
            id='description'
            type='text'
            value={plantingSite?.description}
            display={true}
          />
        </Grid>
      </Grid>
      {plantingSite && <BoundariesAndPlots plantingSite={plantingSite} />}
    </TfMain>
  );
}
