import { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Typography, Grid, Theme, useTheme, List, ListItem } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { RootState } from 'src/redux/rootReducer';
import { DateTime } from 'luxon';
import { Button, DropdownItem } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { PlantingSeason, MinimalPlantingSite } from 'src/types/Tracking';
import { ZoneAggregation } from 'src/types/Observations';
import { useProjects } from 'src/hooks/useProjects';
import { useAppSelector } from 'src/redux/store';
import PageSnackbar from 'src/components/PageSnackbar';
import BoundariesAndZones from './BoundariesAndZones';
import BackToLink from 'src/components/common/BackToLink';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import Card from 'src/components/common/Card';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { View } from 'src/components/common/ListMapSelector';
import SimplePlantingSite from './SimplePlantingSite';

const useStyles = makeStyles((theme: Theme) => ({
  titleWithButton: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: '50px',
  },
}));

export type GenericSiteViewProps<T extends MinimalPlantingSite> = {
  editDisabled?: boolean;
  editUrl: string;
  onDelete: () => void;
  plantingSite: T;
  selector: (state: RootState, plantingSiteId: number, query: string) => ZoneAggregation[];
  zoneViewUrl: string;
};

export default function GenericSiteView<T extends MinimalPlantingSite>({
  editDisabled,
  editUrl,
  onDelete,
  plantingSite,
  selector,
  zoneViewUrl,
}: GenericSiteViewProps<T>): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const tz = useLocationTimeZone().get(plantingSite);
  const [plantingSeasons, setPlantingSeasons] = useState<PlantingSeason[]>([]);
  const [search, setSearch] = useState<string>('');
  const [view, setView] = useState<View>('map');
  const projectsEnabled = isEnabled('Projects');
  const { selectedProject } = useProjects(plantingSite);
  const data = useAppSelector((state) => selector(state, plantingSite.id, view === 'map' ? '' : search.trim()));

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  const goToEditPlantingSite = () => {
    if (!editDisabled) {
      const editPlantingSiteLocation = {
        pathname: editUrl.replace(':plantingSiteId', `${plantingSite.id}`),
      };
      history.push(editPlantingSiteLocation);
    }
  };

  useEffect(() => {
    if (plantingSite.plantingSeasons) {
      // Only show upcoming planting seasons.
      const today = DateTime.fromJSDate(new Date(), { zone: tz.id }).toISODate();
      const upcomingSeasons = plantingSite.plantingSeasons.filter((plantingSeason) => plantingSeason.endDate >= today);
      setPlantingSeasons(upcomingSeasons);
    }
  }, [plantingSite, tz.id]);

  const isMapView = useMemo<boolean>(
    () => view === 'map' || (plantingSite?.boundary !== undefined && plantingSite?.plantingZones === undefined),
    [plantingSite?.boundary, plantingSite?.plantingZones, view]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: isMapView ? 1 : 0 }}>
      <Grid item xs={12} marginBottom={theme.spacing(3)}>
        <BackToLink id='back' to={APP_PATHS.PLANTING_SITES} name={strings.PLANTING_SITES} />
      </Grid>
      <Grid item xs={12} padding={theme.spacing(0, 3)} className={classes.titleWithButton}>
        <Typography fontSize='20px' fontWeight={600}>
          {plantingSite?.name}
        </Typography>
        {editDisabled !== true && (
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
                  onDelete();
                }
              }}
              optionItems={[{ label: strings.DELETE, value: 'delete-planting-site', type: 'destructive' }]}
            />
          </Box>
        )}
      </Grid>
      <Grid item xs={12}>
        <PageSnackbar />
      </Grid>
      <Card
        flushMobile
        style={{
          flexGrow: plantingSite?.boundary ? 1 : 0,
          display: 'flex',
          flexDirection: 'column',
          marginTop: theme.spacing(4),
        }}
      >
        <Grid container>
          <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
            <TextField label={strings.NAME} id='name' type='text' value={plantingSite.name} display={true} />
          </Grid>
          <Grid item xs={gridSize()}>
            <TextField
              label={strings.DESCRIPTION}
              id='description'
              type='text'
              value={plantingSite.description}
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
          {plantingSite.plantingZones && (
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
        {plantingSite.boundary && plantingSite.plantingZones && (
          <BoundariesAndZones
            data={data}
            plantingSite={plantingSite}
            search={search}
            setSearch={setSearch}
            setView={setView}
            view={view}
            zoneViewUrl={zoneViewUrl}
          />
        )}
        {plantingSite.boundary && !plantingSite.plantingZones && (
          <Grid container flexGrow={1}>
            <Grid item xs={12} display='flex'>
              <SimplePlantingSite plantingSite={plantingSite} />
            </Grid>
          </Grid>
        )}
      </Card>
    </Box>
  );
}
