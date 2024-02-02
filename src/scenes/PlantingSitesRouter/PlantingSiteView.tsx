import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Box, Typography, Grid, Theme, useTheme, List, ListItem } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DateTime } from 'luxon';
import { Button, DropdownItem } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import strings from 'src/strings';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { useLocalization } from 'src/providers';
import { PlantingSeason } from 'src/types/Tracking';
import { useProjects } from 'src/hooks/useProjects';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { requestPlantingSite } from 'src/redux/features/tracking/trackingThunks';
import PageSnackbar from 'src/components/PageSnackbar';
import BoundariesAndZones from './BoundariesAndZones';
import BackToLink from 'src/components/common/BackToLink';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import Card from 'src/components/common/Card';
import OptionsMenu from 'src/components/common/OptionsMenu';
import SimplePlantingSite from './SimplePlantingSite';
import DeletePlantingSiteModal from './DeletePlantingSiteModal';

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
  const { activeLocale } = useLocalization();
  const dispatch = useAppDispatch();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, Number(plantingSiteId)));
  const history = useHistory();
  const tz = useLocationTimeZone().get(plantingSite);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [plantingSeasons, setPlantingSeasons] = useState<PlantingSeason[]>([]);
  const projectsEnabled = isEnabled('Projects');
  const { selectedProject } = useProjects(plantingSite);

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

  useEffect(() => {
    if (plantingSite?.plantingSeasons) {
      // Only show upcoming planting seasons.
      const today = DateTime.fromJSDate(new Date(), { zone: tz.id }).toISODate();
      const upcomingSeasons = plantingSite.plantingSeasons.filter((plantingSeason) => plantingSeason.endDate >= today);
      setPlantingSeasons(upcomingSeasons);
    }
  }, [plantingSite, tz.id]);

  useEffect(() => {
    const siteId = Number(plantingSiteId);
    if (!isNaN(siteId)) {
      dispatch(requestPlantingSite(siteId, activeLocale));
    }
  }, [activeLocale, dispatch, plantingSiteId]);

  return (
    <TfMain>
      {deleteModalOpen && plantingSite && (
        <DeletePlantingSiteModal plantingSite={plantingSite} onClose={() => setDeleteModalOpen(false)} />
      )}
      <Grid container padding={theme.spacing(0, 0, 4, 0)}>
        <Grid item xs={12} marginBottom={theme.spacing(3)}>
          <BackToLink id='back' to={APP_PATHS.PLANTING_SITES} name={strings.PLANTING_SITES} />
        </Grid>
        <Grid item xs={12} padding={theme.spacing(0, 3)} className={classes.titleWithButton}>
          <Typography fontSize='20px' fontWeight={600}>
            {plantingSite?.name}
          </Typography>
          <Box display='flex' alignItems='center'>
            <Button
              icon='iconEdit'
              label={isMobile ? undefined : strings.EDIT_PLANTING_SITE}
              priority='primary'
              size='medium'
              onClick={goToEditPlantingSite}
            />
            <OptionsMenu
              size='small'
              onOptionItemClick={(item: DropdownItem) => {
                if (item.value === 'delete-planting-site') {
                  setDeleteModalOpen(true);
                }
              }}
              optionItems={[{ label: strings.DELETE, value: 'delete-planting-site', type: 'destructive' }]}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <PageSnackbar />
        </Grid>
      </Grid>

      <Card flushMobile style={{ flexGrow: plantingSite?.boundary ? 1 : 0, display: 'flex', flexDirection: 'column' }}>
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
          {plantingSite?.plantingZones && (
            <Grid item xs={gridSize()}>
              <TextField
                label={strings.UPCOMING_PLANTING_SEASONS}
                id='upcomingPlantingSeasons'
                type='text'
                display={true}
              />
              <List dense={true}>
                {plantingSeasons.map((plantingSeason) => (
                  <ListItem disableGutters={true} key={plantingSeason.id}>
                    {strings.formatString(strings.DATE_RANGE, plantingSeason.startDate, plantingSeason.endDate)}
                  </ListItem>
                ))}
              </List>
            </Grid>
          )}
          {projectsEnabled && (
            <Grid item xs={gridSize()} display='flex'>
              <TextField
                display={true}
                id='project'
                label={strings.PROJECT}
                type='text'
                value={selectedProject?.name}
              />
            </Grid>
          )}
        </Grid>
        {plantingSite?.boundary && (
          <Grid container flexGrow={1}>
            <Grid item xs={12} display='flex'>
              {plantingSite.plantingZones ? (
                <BoundariesAndZones plantingSite={plantingSite} />
              ) : (
                <SimplePlantingSite plantingSite={plantingSite} />
              )}
            </Grid>
          </Grid>
        )}
      </Card>
    </TfMain>
  );
}
