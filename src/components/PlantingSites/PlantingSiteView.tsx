import TfMain from 'src/components/common/TfMain';
import { Typography, Grid, Theme, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import strings from 'src/strings';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { TrackingService } from 'src/services';
import { APP_PATHS } from 'src/constants';
import { useHistory, useParams } from 'react-router-dom';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { useEffect, useState } from 'react';
import PageSnackbar from '../PageSnackbar';
import { makeStyles } from '@mui/styles';
import { PlantingSite } from 'src/types/Tracking';
import BoundariesAndZones from 'src/components/PlantingSites/BoundariesAndZones';
import BackToLink from 'src/components/common/BackToLink';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import Card from 'src/components/common/Card';
import isEnabled from 'src/features';
import { getMonth } from 'src/utils/dateFormatter';

const useStyles = makeStyles((theme: Theme) => ({
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
  const tz = useLocationTimeZone().get(plantingSite);
  const trackingV2 = isEnabled('TrackingV2');

  useEffect(() => {
    const loadPlantingSite = async () => {
      const response = await TrackingService.getPlantingSite(Number.parseInt(plantingSiteId, 10));
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
          <BackToLink id='back' to={APP_PATHS.PLANTING_SITES} name={strings.PLANTING_SITES} />
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

      <Card flushMobile>
        <Grid container>
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
          <Grid item xs={gridSize()} marginTop={isMobile ? 3 : 0}>
            <TextField
              label={strings.TIME_ZONE}
              id='timezone'
              type='text'
              value={tz.longName}
              tooltipTitle={strings.TOOLTIP_TIME_ZONE_PLANTING_SITE}
              display={true}
            />
          </Grid>
          {trackingV2 && (
            <>
              <Grid item xs={gridSize()} marginTop={isMobile ? 3 : 0}>
                <TextField
                  label={strings.PLANTING_SEASON_START}
                  id='planting-season-start'
                  type='text'
                  value={getMonth(plantingSite?.plantingSeasonStartMonth)}
                  display={true}
                />
              </Grid>
              <Grid item xs={gridSize()} marginTop={isMobile ? 3 : 0}>
                <TextField
                  label={strings.PLANTING_SEASON_END}
                  id='planting-season-end'
                  type='text'
                  value={getMonth(plantingSite?.plantingSeasonEndMonth)}
                  display={true}
                />
              </Grid>
            </>
          )}
          {plantingSite?.boundary && (
            <Grid item xs={12}>
              <BoundariesAndZones plantingSite={plantingSite} />
            </Grid>
          )}
        </Grid>
      </Card>
    </TfMain>
  );
}
